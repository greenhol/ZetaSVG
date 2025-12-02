import { idGenerator } from '../../../utils/unique';
import { Shape, ShapeType } from '../shape';
import { CircleAttr, CircleStyle } from './attributes';

export class Circle extends Shape {

    public id = idGenerator.newId(ShapeType.CIRCLE)
    public type = ShapeType.CIRCLE;

    public style: CircleStyle;

    public attr: CircleAttr;

    constructor(x: number, y: number, r: number, dist: number, style: CircleStyle) {
        super();
        this.attr = {
            cx: x,
            cy: y,
            r: r,
        };
        this.dist = dist;
        this.style = style;
    }

    public setPosition(x: number, y: number, r: number) {
        this.attr.cx = x;
        this.attr.cy = y;
        this.attr.r = r;
    }
}
