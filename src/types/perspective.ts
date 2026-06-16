import { ONE_DEGREE } from './constants';
import { Vector3 } from './vector-3';

export type CameraType = 'Orbit' | 'FreeFly';

export interface Perspective {
    position: Vector3;
    angleX: number;
    angleY: number;
    angleZ: number;
    fov: number;
    type: CameraType;
}

export namespace Perspective {

    export function deepClone(perspective: Perspective): Perspective {
        return { ...perspective, position: { ...perspective.position } };
    }

    export function dimetric(): Perspective {
        return {
            position: { x: 0, y: 0, z: -7.5 },
            angleX: 45 * ONE_DEGREE,
            angleY: 45 * ONE_DEGREE,
            angleZ: 0,
            fov: 90,
            type: 'Orbit',
        };
    };

    export function front(): Perspective {
        return {
            position: { x: 0, y: 0, z: -7.5 },
            angleX: 0,
            angleY: 0,
            angleZ: 0,
            fov: 90,
            type: 'Orbit',
        };
    };

    export function side(): Perspective {
        return {
            position: { x: 0, y: 0, z: -7.5 },
            angleX: 0,
            angleY: -90 * ONE_DEGREE,
            angleZ: 0,
            fov: 90,
            type: 'Orbit',
        };
    };

    export function top(): Perspective {
        return {
            position: { x: 0, y: 0, z: -7.5 },
            angleX: 90 * ONE_DEGREE,
            angleY: 0,
            angleZ: 0,
            fov: 90,
            type: 'Orbit',
        };
    };

    export function freeFly(): Perspective {
        return {
            position: { x: 0, y: 2, z: -7.5 },
            angleX: 0,
            angleY: 0,
            angleZ: 0,
            fov: 90,
            type: 'FreeFly',
        };
    };

    export function toString(perspective: Perspective): string {
        const position = `X:${perspective.position.x.toFixed(1)}, Y:${perspective.position.y.toFixed(1)}, Z:${perspective.position.z.toFixed(1)}`;
        const angleX = (perspective.angleX * 180 / Math.PI).toFixed(0);
        const angleY = (perspective.angleY * 180 / Math.PI).toFixed(0);
        const angleZ = (perspective.angleZ * 180 / Math.PI).toFixed(0);
        const angles = `X:${angleX}°, Y:${angleY}°, Z:${angleZ}°`;
        return `${perspective.type} - Pos:(${position}) - Angles:(${angles}) - FOV:${perspective.fov}°`;
    }
}
