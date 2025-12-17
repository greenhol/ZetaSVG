import { Vector3 } from '../../vector-3';
import { ShapeType } from '../shape';
import { Shape3d } from '../shape3d';
import { defaultTextStyle, Text3dAttributes, TextStyle } from './index';

export class Text3d extends Shape3d<Text3dAttributes> {

    override type: ShapeType = ShapeType.TEXT;

    private _position: Vector3;
    private _text: string;
    private _lockFontSize: boolean;
    private _style: TextStyle;

    constructor(position: Vector3, text: string, lockFontSize: boolean = false, style: TextStyle = defaultTextStyle()) {
        super();
        this.position = position;
        this.text = text;
        this._lockFontSize = lockFontSize;
        this.style = style;
    }

    public get position() {
        return this._position;
    }

    public set position(position: Vector3) {
        this._position = position;
    }

    public get text() {
        return this._text;
    }

    public set text(text: string) {
        this._text = text;
    }

    public get style() {
        return this._style;
    }

    public set style(style: TextStyle) {
        this._style = style;
    }

    public get attributes(): Text3dAttributes {
        return {
            type: this.type,
            position: structuredClone(this._position),
            text: this._text,
            lockFontSize: this._lockFontSize,
            style: structuredClone(this._style),
        }
    }
}
