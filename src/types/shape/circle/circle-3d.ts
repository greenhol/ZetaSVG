import { SpaceCoord } from '../../space-coord';
import { Shape3d } from '../shape3d';
import { Circle3dAttributes, CircleStyle, defaultStyle } from './attributes';

export class Circle3d extends Shape3d<Circle3dAttributes> {
    private _position: SpaceCoord;
    private _radius: number;
    private _style: CircleStyle;

    constructor(position: SpaceCoord, radius: number = 1, style: CircleStyle = defaultStyle) {
        super()
        this.position = position;
        this.radius = radius;
        this.style = style;
    }

    public get position() {
        return this._position;
    }

    public set position(position: SpaceCoord) {
        this._position = position;
    }

    public get radius() {
        return this._radius;
    }

    public set radius(radius: number) {
        this._radius = radius;
    }

    public get style() {
        return this._style;
    }

    public set style(style: CircleStyle) {
        this._style = style;
    }

    public get attributes(): Circle3dAttributes {
        return {
            position: structuredClone(this._position),
            radius: this._radius,
            style: structuredClone(this._style),
        }
    }
}
