import { Vector3 } from '../types/vector-3';

export function clipLine3DByFactor(start: Vector3, end: Vector3, clipFactorStart: number, clipFactorEnd: number): Vector3[] {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const dz = end.z - start.z;

    return [{
        x: start.x + (dx * clipFactorStart),
        y: start.y + (dy * clipFactorStart),
        z: start.z + (dz * clipFactorStart),
    }, {
        x: end.x - (dx * clipFactorEnd),
        y: end.y - (dy * clipFactorEnd),
        z: end.z - (dz * clipFactorEnd),
    }];
}

export function clipLine3DByLength(start: Vector3, end: Vector3, shortenStartBy: number, shortenEndBy: number): Vector3[] {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const dz = end.z - start.z;
    const length = Math.sqrt(dx * dx + dy * dy + dz * dz);

    const normalizedDx = dx / length;
    const normalizedDy = dy / length;
    const normalizedDz = dz / length;

    return [
        {
            x: start.x + normalizedDx * shortenStartBy,
            y: start.y + normalizedDy * shortenStartBy,
            z: start.z + normalizedDz * shortenStartBy,
        },
        {
            x: end.x - normalizedDx * shortenEndBy,
            y: end.y - normalizedDy * shortenEndBy,
            z: end.z - normalizedDz * shortenEndBy,
        },
    ];
}