import { Vector3 } from '../types/vector-3';

export function clipLine3D(start: Vector3, end: Vector3, clipFactor1: number, clipFactor2: number): Vector3[] {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const dz = end.z - start.z;

    return [{
        x: start.x + (dx * clipFactor1),
        y: start.y + (dy * clipFactor1),
        z: start.z + (dz * clipFactor1),
    }, {
        x: end.x - (dx * clipFactor2),
        y: end.y - (dy * clipFactor2),
        z: end.z - (dz * clipFactor2),
    }];
}