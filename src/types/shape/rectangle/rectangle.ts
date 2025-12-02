import { idGenerator } from '../../../utils/unique';
import { Shape, ShapeType } from '../shape';
import { RectangleAttr, RectangleStyle } from './attributes';

export class Rectangle extends Shape {

    public id = idGenerator.newId(ShapeType.RECTANGLE)
    public type = ShapeType.RECTANGLE;

    public style: RectangleStyle;

    public attr: RectangleAttr;

    constructor(d: string, dist: number, style: RectangleStyle) {
        super();
        this.attr = {
            d: d,
        };
        this.dist = dist;
        this.style = style;
    }

    public setPath(d: string) {
        this.attr.d = d;
    }
}
