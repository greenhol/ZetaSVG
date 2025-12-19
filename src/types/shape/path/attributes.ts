import { Vector3 } from '../../vector-3';
import { ShapeType } from '../shape';
import { Shape3dAttributes } from '../shape3d';
import { PathStyle } from './index';

export interface Path3dAttributes extends Shape3dAttributes {
    type: ShapeType,
    path: Vector3[],
    close: boolean,
    lockStrokeWidth: boolean,
    style: PathStyle,
}

export interface PathAttr {
    d: string;
}
