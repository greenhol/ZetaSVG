import { Vector3 } from '../../vector-3';
import { ShapeType } from '../shape';

export interface Circle3dAttributes {
    type: ShapeType,
    position: Vector3,
    radius: number, // scales with distance
    style: CircleStyle,
}

export interface CircleStyle {
    strokeWidth: number; // scales with distance
    stroke: string;
    strokeOpacity: number;
    fill: string;
    fillOpacity: number;
}

export function createDefaultStyle(): CircleStyle {
    return {
        strokeWidth: 0.15,
        stroke: '#aaa',
        strokeOpacity: 1,
        fill: '#ddd',
        fillOpacity: 1,
    };
}

export interface CircleAttr {
    cx: number;
    cy: number;
    r: number;
}
