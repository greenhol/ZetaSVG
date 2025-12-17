import { Vector3 } from '../../vector-3';
import { ShapeType } from '../shape';
import { PathStyle } from './index';

export interface Path3dAttributes {
    type: ShapeType,
    path: Vector3[],
    close: boolean,
    lockStrokeWidth: boolean,
    style: PathStyle,
}

export interface PathAttr {
    d: string;
}
