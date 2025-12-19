import { Vector3 } from '../../vector-3';
import { ShapeType } from '../shape';
import { Shape3dAttributes } from '../shape3d';
import { RectangleStyle } from './index';

export interface Rectangle3dAttributes extends Shape3dAttributes {
    type: ShapeType,
    path: Vector3[],
    style: RectangleStyle,
}

export interface RectangleAttr {
    d: string;
}
