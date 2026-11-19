import { Vector3 } from '../../types/vector-3';

// Numerics
const JACOBI_SWEEPS = 10; // sweeps of the Jacobi eigenvalue method (a 3x3 matrix converges in about 5)

export type Matrix3 = number[][]; // row-major 3x3

export interface PointMass {
    position: Vector3;
    mass: number;
}

export interface BodyAnalysis {
    centre: Vector3;      // centre of mass
    moments: number[];    // principal moments of inertia, ascending: [smallest, intermediate, largest]
    axes: Vector3[];      // matching principal axes (unit vectors, right-handed)
}

export function identityMatrix(): Matrix3 {
    return [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
}

export function applyMatrix(m: Matrix3, v: Vector3): Vector3 {
    return {
        x: m[0][0] * v.x + m[0][1] * v.y + m[0][2] * v.z,
        y: m[1][0] * v.x + m[1][1] * v.y + m[1][2] * v.z,
        z: m[2][0] * v.x + m[2][1] * v.y + m[2][2] * v.z,
    };
}

/** Centre of mass, inertia tensor and principal axes of a set of point masses. */
export function analyseBody(masses: PointMass[]): BodyAnalysis {
    const centre = centreOfMass(masses);
    const { values, vectors } = jacobiEigen(inertiaTensor(masses, centre));
    const order = [0, 1, 2].sort((a, b) => values[a] - values[b]);
    const e0 = column(vectors, order[0]);
    const e1 = column(vectors, order[1]);
    const e2 = cross(e0, e1); // right-handed by construction
    return {
        centre,
        moments: order.map((i) => values[i]),
        axes: [e0, e1, e2],
    };
}

/**
 * A flip needs three clearly different principal moments (smallest < intermediate < largest).
 * minRelativeGap is the smallest accepted gap between neighbouring moments, relative to the largest moment.
 */
export function hasIntermediateAxis(moments: number[], minRelativeGap: number): boolean {
    const [i1, i2, i3] = moments;
    if (!(i1 > 0)) return false; // collinear masses (rod) or no mass at all
    return (i2 - i1) / i3 > minRelativeGap && (i3 - i2) / i3 > minRelativeGap;
}

/**
 * Torque-free rotation of a rigid body (Euler's equations), integrated tick by tick with RK4.
 * Results are cached, so rotationAt(t) is a deterministic function of t that costs
 * one integration step per new tick and nothing for ticks already seen.
 */
export class RigidBodySpin {

    private _moments: number[];
    private _substeps: number;
    private _initialAxes: number[][];       // principal axes at t = 0 (rows)
    private _state: number[];               // [R (9, row-major, body -> world), omega in body frame (3)]
    private _cache: Matrix3[] = [identityMatrix()];

    /**
     * @param moments principal moments, ascending
     * @param axes principal axes in the world frame at t = 0
     * @param spinRate angular speed around the intermediate axis in rad per tick
     * @param perturbation angular speed around the other two axes, relative to spinRate
     * @param substeps integration steps per tick
     */
    constructor(moments: number[], axes: Vector3[], spinRate: number, perturbation: number, substeps: number) {
        this._moments = moments;
        this._substeps = substeps;
        this._initialAxes = axes.map((a) => [a.x, a.y, a.z]);

        // R(0): columns are the principal axes
        const r0: number[] = [];
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                r0.push(this._initialAxes[col][row]);
            }
        }
        const omega0 = [perturbation * spinRate, spinRate, perturbation * spinRate];
        this._state = [...r0, ...omega0];
    }

    /** Rotation that takes the body from its start orientation (t = 0) to its orientation at tick t. */
    public rotationAt(t: number): Matrix3 {
        const tick = Math.max(0, Math.floor(t));
        while (this._cache.length <= tick) {
            this.advance();
        }
        return this._cache[tick];
    }

    private advance(): void {
        const h = 1 / this._substeps;
        let s = this._state;
        for (let i = 0; i < this._substeps; i++) {
            s = this.orthonormalize(this.rk4(s, h));
        }
        this._state = s;
        this._cache.push(this.toTransform(s));
    }

    private rk4(s: number[], h: number): number[] {
        const k1 = this.derivative(s);
        const k2 = this.derivative(addScaled(s, k1, h / 2));
        const k3 = this.derivative(addScaled(s, k2, h / 2));
        const k4 = this.derivative(addScaled(s, k3, h));
        return s.map((v, i) => v + (h / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
    }

    private derivative(s: number[]): number[] {
        const [i1, i2, i3] = this._moments;
        const w1 = s[9];
        const w2 = s[10];
        const w3 = s[11];
        const d: number[] = new Array(12);

        // R' = R * skew(omega)
        for (let r = 0; r < 3; r++) {
            const a = s[3 * r];
            const b = s[3 * r + 1];
            const c = s[3 * r + 2];
            d[3 * r] = b * w3 - c * w2;
            d[3 * r + 1] = -a * w3 + c * w1;
            d[3 * r + 2] = a * w2 - b * w1;
        }

        // Euler's equations in the principal frame
        d[9] = ((i2 - i3) / i1) * w2 * w3;
        d[10] = ((i3 - i1) / i2) * w3 * w1;
        d[11] = ((i1 - i2) / i3) * w1 * w2;
        return d;
    }

    /** Gram-Schmidt on the columns of R, removes the numerical drift. */
    private orthonormalize(s: number[]): number[] {
        const c0 = normalize([s[0], s[3], s[6]]);
        const c1raw = [s[1], s[4], s[7]];
        const proj = dot(c1raw, c0);
        const c1 = normalize(c1raw.map((v, i) => v - proj * c0[i]));
        const c2 = crossArray(c0, c1);
        return [
            c0[0], c1[0], c2[0],
            c0[1], c1[1], c2[1],
            c0[2], c1[2], c2[2],
            s[9], s[10], s[11],
        ];
    }

    /** M = R * Q0^T, applied to the start positions it gives the current positions. */
    private toTransform(s: number[]): Matrix3 {
        const m: Matrix3 = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                let sum = 0;
                for (let k = 0; k < 3; k++) {
                    sum += s[3 * i + k] * this._initialAxes[k][j];
                }
                m[i][j] = sum;
            }
        }
        return m;
    }
}

function centreOfMass(masses: PointMass[]): Vector3 {
    const total = masses.reduce((sum, m) => sum + m.mass, 0);
    if (total <= 0) {
        // No mass at all: fall back to the plain average of the positions
        const n = masses.length;
        return {
            x: masses.reduce((sum, m) => sum + m.position.x, 0) / n,
            y: masses.reduce((sum, m) => sum + m.position.y, 0) / n,
            z: masses.reduce((sum, m) => sum + m.position.z, 0) / n,
        };
    }
    return {
        x: masses.reduce((sum, m) => sum + m.mass * m.position.x, 0) / total,
        y: masses.reduce((sum, m) => sum + m.mass * m.position.y, 0) / total,
        z: masses.reduce((sum, m) => sum + m.mass * m.position.z, 0) / total,
    };
}

function inertiaTensor(masses: PointMass[], centre: Vector3): Matrix3 {
    const tensor: Matrix3 = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    for (const { position, mass } of masses) {
        const r = [position.x - centre.x, position.y - centre.y, position.z - centre.z];
        const rr = dot(r, r);
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                tensor[i][j] += mass * ((i === j ? rr : 0) - r[i] * r[j]);
            }
        }
    }
    return tensor;
}

/** Eigenvalues and eigenvectors (as columns of `vectors`) of a symmetric 3x3 matrix. */
function jacobiEigen(matrix: Matrix3): { values: number[]; vectors: Matrix3; } {
    const a = matrix.map((row) => [...row]);
    const v = identityMatrix();
    const pairs = [[0, 1], [0, 2], [1, 2]];

    for (let sweep = 0; sweep < JACOBI_SWEEPS; sweep++) {
        for (const [p, q] of pairs) {
            if (a[p][q] === 0) continue;
            const theta = (a[q][q] - a[p][p]) / (2 * a[p][q]);
            const t = (theta >= 0 ? 1 : -1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1));
            const c = 1 / Math.sqrt(t * t + 1);
            const s = t * c;

            for (let k = 0; k < 3; k++) {
                const akp = a[k][p];
                const akq = a[k][q];
                a[k][p] = c * akp - s * akq;
                a[k][q] = s * akp + c * akq;
            }
            for (let k = 0; k < 3; k++) {
                const apk = a[p][k];
                const aqk = a[q][k];
                a[p][k] = c * apk - s * aqk;
                a[q][k] = s * apk + c * aqk;
            }
            for (let k = 0; k < 3; k++) {
                const vkp = v[k][p];
                const vkq = v[k][q];
                v[k][p] = c * vkp - s * vkq;
                v[k][q] = s * vkp + c * vkq;
            }
        }
    }
    return { values: [a[0][0], a[1][1], a[2][2]], vectors: v };
}

function column(m: Matrix3, index: number): Vector3 {
    return { x: m[0][index], y: m[1][index], z: m[2][index] };
}

function cross(a: Vector3, b: Vector3): Vector3 {
    return {
        x: a.y * b.z - a.z * b.y,
        y: a.z * b.x - a.x * b.z,
        z: a.x * b.y - a.y * b.x,
    };
}

function crossArray(a: number[], b: number[]): number[] {
    return [
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0],
    ];
}

function dot(a: number[], b: number[]): number {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function normalize(a: number[]): number[] {
    const length = Math.sqrt(dot(a, a));
    return a.map((v) => v / length);
}

function addScaled(s: number[], k: number[], h: number): number[] {
    return s.map((v, i) => v + h * k[i]);
}
