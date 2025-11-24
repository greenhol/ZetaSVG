import { SpaceCoord } from '../../space-coord';

export interface Rectangle3dAttributes {
    path: SpaceCoord[],
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
        strokeWidth: 0.5,
        stroke: '#aaa',
        strokeOpacity: 1,
        fill: '#ddd',
        fillOpacity: 1,
    }
}

export interface RectangleAttr {
    d: string;
}
