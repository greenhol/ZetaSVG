import { Vector3 } from '../../vector-3';
import { ShapeType } from '../shape';
import { Shape3d } from '../shape3d';
import { Circle3dAttributes, CircleStyle, defaultCircleStyle } from './index';

export class Circle3d extends Shape3d<Circle3dAttributes> {

    override type: ShapeType = ShapeType.CIRCLE;

    private _position: Vector3;
    private _radius: number;
    private _style: CircleStyle;

    constructor(position: Vector3, radius: number = 1, style: CircleStyle = defaultCircleStyle()) {
        super()
        this.position = position;
        this.radius = radius;
        this.style = style;
    }

    public get position() {
        return this._position;
    }

    public set position(position: Vector3) {
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
            type: this.type,
            position: structuredClone(this._position),
            radius: this._radius,
            style: structuredClone(this._style),
        }
    }
}
