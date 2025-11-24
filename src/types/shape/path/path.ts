import { idGenerator } from '../../../utils/unique';
import { PathAttr, PathStyle } from '../path/attributes';
import { Shape, ShapeType } from '../shape';

export class Path extends Shape {

    public id = idGenerator.newId(ShapeType.PATH)
    public type = ShapeType.PATH;

    public style: PathStyle;

    public attr: PathAttr;

    constructor(d: string, style: PathStyle) {
        super();
        this.attr = {
            d: d,
        };
        this.style = style;
    }

    public setPath(d: string) {
        this.attr.d = d;
    }
}
