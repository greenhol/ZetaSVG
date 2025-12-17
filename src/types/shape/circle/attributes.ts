import { Vector3 } from '../../vector-3';
import { ShapeType } from '../shape';
import { CircleStyle } from './index';

export interface Circle3dAttributes {
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
