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

    export function interpolate(pos1: Vector3, pos2: Vector3, t: number): Vector3 {
        return {
            x: pos1.x + t * (pos2.x - pos1.x),
            y: pos1.y + t * (pos2.y - pos1.y),
            z: pos1.z + t * (pos2.z - pos1.z),
        };
    }
}
