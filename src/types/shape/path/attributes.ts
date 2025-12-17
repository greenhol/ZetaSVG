import { Vector3 } from '../../vector-3';
import { ShapeType } from '../shape';

export interface Path3dAttributes {
    type: ShapeType,
    path: Vector3[],
    close: boolean,
    lockStrokeWidth: boolean,
    style: PathStyle,
}

export interface PathStyle {
    strokeWidth: number; // scales with distance (if lockStrokeWidth false)
    stroke: string;
    strokeOpacity: number;
}

export function createDefaultStyle(): PathStyle {
    return {
        strokeWidth: 1.5,
        stroke: '#aaa',
        strokeOpacity: 1,
    }
};

export interface PathAttr {
    d: string;
}
