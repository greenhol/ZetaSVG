import { SpaceCoord } from '../../space-coord';

export interface Circle3dAttributes {
    position: SpaceCoord,
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

export const defaultStyle: CircleStyle = {
    strokeWidth: 0.1,
    stroke: '#aaa',
    strokeOpacity: 1,
    fill: '#ddd',
    fillOpacity: 1,
};

export interface CircleAttr {
    cx: number;
    cy: number;
    r: number;
}
