import { SpaceCoord } from '../../space-coord';
import { Shape3d } from '../shape3d';
import { createDefaultStyle, Text3dAttributes, TextStyle } from './attributes';

export class Text3d extends Shape3d<Text3dAttributes> {
    private _position: SpaceCoord;
    private _text: string;
    private _lockFontSize: boolean;
    private _style: TextStyle;

    constructor(position: SpaceCoord, text: string, lockFontSize: boolean = false, style: TextStyle = createDefaultStyle()) {
        super();
        this.position = position;
        this.text = text;
        this._lockFontSize = lockFontSize;
        this.style = style;
    }

    public get position() {
        return this._position;
    }

    public set position(position: SpaceCoord) {
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
            position: structuredClone(this._position),
            text: this._text,
            lockFontSize: this._lockFontSize,
            style: structuredClone(this._style),
        }
    }
}
