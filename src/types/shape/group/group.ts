import { idGenerator } from '../../../utils/unique';
import { Shape, ShapeType } from '../shape';
import { GroupAttr, GroupChild, SortBy } from './index';
export class Group extends Shape {

    public id = idGenerator.newId(ShapeType.GROUP)
    public type = ShapeType.GROUP;

    public attr: GroupAttr;

    constructor(
        children: GroupChild[],
        sortBy: SortBy,
        dist: number,
        visible: boolean,
    ) {
        super(visible);
        this.attr = {
            children: children,
            sortBy: sortBy,
        };
        this.dist = dist;
    }

    public get children(): GroupChild[] {
        return this.attr.children;
    }

    public set sortBy(sortBy: SortBy) {
        this.attr.sortBy = sortBy;
    }
}
