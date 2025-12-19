import { idGenerator } from '../../../utils/unique';
import { Shape, ShapeType } from '../shape';
import { TextAttr, TextStyle } from './index';

export class Text extends Shape {

    public id = idGenerator.newId(ShapeType.TEXT)
    public type = ShapeType.TEXT;

    public style: TextStyle;

    public attr: TextAttr;

    constructor(
        x: number,
        y: number,
        text: string,
        dist: number,
        style: TextStyle,
        visible: boolean,
    ) {
        super(visible);
        this.attr = {
            x: x,
            y: y,
            text: text,
        };
        this.dist = dist;
        this.style = style;
    }

    public setPosition(x: number, y: number) {
        this.attr.x = x;
        this.attr.y = y;
    }

    public setText(text: string) {
        this.attr.text = text;
    }
}
