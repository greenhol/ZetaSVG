import { Vector3 } from '../../vector-3';
import { ShapeType } from '../shape';
import { Shape3dAttributes } from '../shape3d';
import { CircleStyle } from './index';

export interface Circle3dAttributes extends Shape3dAttributes {
    type: ShapeType,
    position: Vector3,
    radius: number, // scales with distance
    style: CircleStyle,
}

export interface CircleAttr {
    cx: number;
    cy: number;
    r: number;
}
