import { SpaceCoord } from '../../space-coord';

export interface Path3dAttributes {
    path: SpaceCoord[],
    close: boolean,
    style: PathStyle,
}

export interface PathStyle {
    strokeWidth: number;
    stroke: string;
    strokeOpacity: number;
}

export const defaultStyle: PathStyle = {
    strokeWidth: 1.5,
    stroke: '#aaa',
    strokeOpacity: 1,
};

export interface PathAttr {
    d: string;
}
