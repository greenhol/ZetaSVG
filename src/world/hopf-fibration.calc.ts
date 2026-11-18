import { Vector3 } from '../types/vector-3';

export enum HopfMotion {
    None = 'None',
    Rotate4D = 'Rotate 4D',
    SweepTheta = 'Sweep Theta',
}

// Geometry
export const THETA_MIN = 0.25 * Math.PI;            // first latitude (polar angle on the base 2-sphere)
export const THETA_MAX = 0.65 * Math.PI;            // last latitude
export const CHUNKS_PER_FIBER = 14;                 // each fiber is split into this many paths
export const SEGMENTS_PER_CHUNK = 20;                // line segments per chunk (-> 9 points)
const CHUNK_TRIM_SEGMENTS = 0.5;                    // each chunk end is pulled back by this many segments, so two neighbours are 1 segment apart
const MIN_DENOMINATOR = 0.05;                       // clamp for (1 - d) in the stereographic projection
export const MAX_RADIUS = 8;                        // chunks with a point further than this from the origin are hidden
const FULL_TURN = 2 * Math.PI;                      // one full circle in radians
const ANGLE_PER_SEGMENT = FULL_TURN / (CHUNKS_PER_FIBER * SEGMENTS_PER_CHUNK); // fiber parameter step per segment

// Sweep (SweepTheta motion)
const SWEEP_AMPLITUDE = 0.12 * Math.PI;             // maximum latitude offset
const SWEEP_THETA_MIN = 0.2 * Math.PI;              // lower clamp of the swept latitude
const SWEEP_THETA_MAX = 0.7 * Math.PI;              // upper clamp of the swept latitude

/** One fiber = one point (theta, phi) on the base 2-sphere. */
export interface FiberParams {
    theta: number;  // polar angle
    phi: number;    // azimuth
}

/** All fibers: LATITUDE_COUNT latitudes x AZIMUTH_COUNT azimuths. Latitude is the outer loop. */
export function createFiberParams(latitudeCount: number, azimuthCount: number): FiberParams[] {
    const fibers: FiberParams[] = [];
    for (let i = 0; i < latitudeCount; i++) {
        const theta = THETA_MIN + (i * (THETA_MAX - THETA_MIN)) / (latitudeCount - 1);
        for (let j = 0; j < azimuthCount; j++) {
            fibers.push({ theta, phi: (j * FULL_TURN) / azimuthCount });
        }
    }
    return fibers;
}

/** Latitude offset by a sweep value in [-1, 1] (a sine), clamped to the allowed range. */
export function sweptTheta(baseTheta: number, sweep: number): number {
    return Math.min(SWEEP_THETA_MAX, Math.max(SWEEP_THETA_MIN, baseTheta + SWEEP_AMPLITUDE * sweep));
}

/**
 * The 9 projected points of one chunk of a fiber.
 * psi is the rotation angle in the a-d plane of 4D space (0 = no rotation).
 */
export function chunkPoints(theta: number, phi: number, chunkIndex: number, psi: number): Vector3[] {
    const cosPsi = Math.cos(psi);
    const sinPsi = Math.sin(psi);
    const usedSegments = SEGMENTS_PER_CHUNK - 2 * CHUNK_TRIM_SEGMENTS;

    const points: Vector3[] = [];
    for (let j = 0; j <= SEGMENTS_PER_CHUNK; j++) {
        const segmentPosition = chunkIndex * SEGMENTS_PER_CHUNK + CHUNK_TRIM_SEGMENTS + (j * usedSegments) / SEGMENTS_PER_CHUNK;
        points.push(projectedPoint(theta, phi, segmentPosition * ANGLE_PER_SEGMENT, cosPsi, sinPsi));
    }
    return points;
}

/** True if any point is further than MAX_RADIUS from the origin. */
export function exceedsMaxRadius(points: Vector3[]): boolean {
    return points.some((point) => Vector3.abs(point) > MAX_RADIUS);
}

/** Point on the fiber at parameter t: 4D point (a, b, c, d), rotated in the a-d plane, stereographically projected to 3D. */
function projectedPoint(theta: number, phi: number, t: number, cosPsi: number, sinPsi: number): Vector3 {
    const radius1 = Math.cos(theta / 2);
    const radius2 = Math.sin(theta / 2);

    const a = radius1 * Math.cos(t);            // Re z1
    const b = radius1 * Math.sin(t);            // Im z1
    const c = radius2 * Math.cos(t + phi);      // Re z2
    const d = radius2 * Math.sin(t + phi);      // Im z2

    const aRotated = a * cosPsi - d * sinPsi;
    const dRotated = a * sinPsi + d * cosPsi;

    const denominator = Math.max(1 - dRotated, MIN_DENOMINATOR);
    return {
        x: aRotated / denominator,
        y: c / denominator,
        z: b / denominator,
    };
}
