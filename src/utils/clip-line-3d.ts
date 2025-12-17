import { Vector3 } from '../types/vector-3';

export function clipLine3D(start: Vector3, end: Vector3, clipPercent: number): Vector3[] {
    const clipFactor = clipPercent / 100;
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const dz = end.z - start.z;

    return [{
        x: start.x + (dx * clipFactor),
        y: start.y + (dy * clipFactor),
        z: start.z + (dz * clipFactor),
    }, {
        x: end.x - (dx * clipFactor),
        y: end.y - (dy * clipFactor),
        z: end.z - (dz * clipFactor),
    }];
}