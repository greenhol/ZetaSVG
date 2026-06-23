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

    export function distance(a: Vector3, b: Vector3): number {
        return abs({
            x: b.x - a.x,
            y: b.y - a.y,
            z: b.z - a.z,
        });
    }

    export function interpolate(a: Vector3, b: Vector3, t: number): Vector3 {
        return {
            x: a.x + t * (b.x - a.x),
            y: a.y + t * (b.y - a.y),
            z: a.z + t * (b.z - a.z),
        };
    }

    export function interpolateByDensity(a: Vector3, b: Vector3, density: number, elementSize: number): Vector3[] {
        const retval: Vector3[] = [];
        if (density === 0) return retval;

        const length = Vector3.distance(a, b);
        const maxSteps = length / elementSize;
        const steps = Math.round((density / 10) * maxSteps);

        if (steps < 1) return retval;

        for (let i = 1; i < steps; i++) {
            const t = i / steps;
            retval.push(Vector3.interpolate(a, b, t));
        }
        return retval;
    }
}
