import { Vector3 } from '../../vector-3';

export interface Rectangle3dAttributes {
    path: Vector3[],
    style: RectangleStyle,
}

export interface RectangleStyle {
    strokeWidth: number; // scales with distance
    stroke: string;
    strokeOpacity: number;
    fill: string;
    fillOpacity: number;
}

export function createDefaultStyle(): RectangleStyle {
    return {
        strokeWidth: 1.5,
        stroke: '#aaa',
        strokeOpacity: 1,
        fill: '#ddd',
        fillOpacity: 1,
    }
}

export interface RectangleAttr {
    d: string;
}
