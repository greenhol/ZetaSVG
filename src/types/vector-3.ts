export interface Vector3 {
    x: number;
    y: number;
    z: number;
}

export namespace Vector3 {

    export function origin(): Vector3 {
        return { x: 0, y: 0, z: 0 };
    }

    export function abs(a: Vector3): number {
        return Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z);
    }

    export function add(a: Vector3, b: Vector3): Vector3 {
        return {
            x: a.x + b.x,
            y: a.y + b.y,
            z: a.z + b.z,
        };
    }

    export function scalarMultiply(a: number, v: Vector3): Vector3 {
        return {
            x: a * v.x,
            y: a * v.y,
            z: a * v.z,
        };
    }
}
