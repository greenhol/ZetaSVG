import { idGenerator } from '../../../utils/unique';
import { Shape, ShapeType } from '../shape';
import { PathAttr, PathStyle } from './index';

export class Path extends Shape {

    public id = idGenerator.newId(ShapeType.PATH)
    public type = ShapeType.PATH;

    public style: PathStyle;

    public attr: PathAttr;

    constructor(
        d: string,
        dist: number,
        style: PathStyle,
        visible: boolean,
    ) {
        super(visible);
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
