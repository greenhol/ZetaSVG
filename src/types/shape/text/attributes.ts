import { Vector3 } from '../../vector-3';
import { ShapeType } from '../shape';
import { Shape3dAttributes } from '../shape3d';
import { TextStyle } from './index';

export interface Text3dAttributes extends Shape3dAttributes {
    type: ShapeType,
    position: Vector3,
    text: string,
    lockFontSize: boolean,
    style: TextStyle,
}

export interface TextAttr {
    x: number,
    y: number,
    text: string;
}
