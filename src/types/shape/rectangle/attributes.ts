import { Vector3 } from '../../vector-3';
import { ShapeType } from '../shape';
import { RectangleStyle } from './index';

export interface Rectangle3dAttributes {
    type: ShapeType,
    path: Vector3[],
    style: RectangleStyle,
}

export interface RectangleAttr {
    d: string;
}
