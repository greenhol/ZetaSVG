export interface Vector3 {
    x: number;
    y: number;
    z: number;
}

export function createOrigin(): Vector3 {
    return { x: 0, y: 0, z: 0 };
}

export function addVector3(a: Vector3, b: Vector3): Vector3 {
    return {
        x: a.x + b.x,
        y: a.y + b.y,
        z: a.z + b.z,
    }
}
