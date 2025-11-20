import { SpaceCoord } from '../space-coord';
import { idGenerator } from '../../utils/unique';
import { Shape, ShapeType } from './shape';

export type AlignmentBaseline = 'auto' | 'baseline' | 'before-edge' | 'text-before-edge' | 'middle' | 'central' | 'after-edge' | 'text-after-edge' | 'ideographic' | 'alphabetic' | 'hanging' | 'mathematical' | 'top' | 'center' | 'bottom';

export interface Text3dAttributes {
    position: SpaceCoord,
    text: string,
    style: TextStyle,
}

export interface TextStyle {
    fontSize: number;
    fontFamily: string;
    fill: string;
    fillOpacity: number;
    alignmentBaseline: AlignmentBaseline;
}

export interface TextAttr {
    x: number,
    y: number,
    fontSize: number;
    text: string;
}

const defaultStyle: TextStyle = {
    fontSize: 12,
    fontFamily: 'sans-serif',
    fill: '#666',
    fillOpacity: 1,
    alignmentBaseline: 'baseline',
};

export class Text3d implements Text3dAttributes {
    private _position: SpaceCoord;
    private _text: string;
    private _style: TextStyle;

    constructor(position: SpaceCoord, text: string, style: TextStyle = defaultStyle) {
        this.position = position;
        this.text = text;
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
}

export class Text extends Shape {

    public id = idGenerator.newId(ShapeType.TEXT)
    public type = ShapeType.TEXT;

    public style: TextStyle = defaultStyle;

    public attr: TextAttr;

    constructor(x: number, y: number, fontSize: number, text: string) {
        super();
        this.attr = {
            x: x,
            y: y,
            fontSize: fontSize,
            text: text,
        }
    }

    public setPosition(x: number, y: number, fontSize: number) {
        this.attr.x = x;
        this.attr.y = y;
        this.attr.fontSize = fontSize;
    }

    public setText(text: string) {
        this.attr.text = text;
    }
}
