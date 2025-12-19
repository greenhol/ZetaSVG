import { Vector3 } from '../../vector-3';
import { Circle3d } from '../circle';
import { Path3d } from '../path';
import { ShapeType } from '../shape';
import { Shape3d } from '../shape3d';
import { Group3dAttributes, SortBy } from './index';

export class Group3d extends Shape3d<Group3dAttributes> {

    override type: ShapeType = ShapeType.GROUP;

    private _position: Vector3;
    private _children: (Circle3d | Path3d)[];
    private _sortBy: SortBy;

    constructor(
        position: Vector3,
        children: (Circle3d | Path3d)[],
        sortBy: SortBy = SortBy.DISTANCE,
        visible: boolean = true,
    ) {
        super(visible);
        this.position = position;
        this._children = children;
        this._sortBy = sortBy;
    }

    public get position() {
        return this._position;
    }

    public set position(position: Vector3) {
        this._position = position;
    }

    public get children() {
        return this._children;
    }

    public set children(children: (Circle3d | Path3d)[]) {
        this._children = children;
    }

    public get attributes(): Group3dAttributes {
        return {
            visible: this.visible,
            type: this.type,
            position: structuredClone(this._position),
            children: structuredClone(this._children.map((child: Circle3d | Path3d) => child.attributes)),
            sortBy: this._sortBy,
        }
    }
}
