import { Vector3 } from '../../vector-3';
import { ShapeType } from '../shape';
import { Shape3d } from '../shape3d';
import { defaultPathStyle, Path3dAttributes, PathStyle } from './index';

export class Path3d extends Shape3d<Path3dAttributes> {

    override type: ShapeType = ShapeType.PATH;

    private _path: Vector3[];
    private _close: boolean;
    private _lockStrokeWidth: boolean;
    private _style: PathStyle;

    constructor(path: Vector3[], close: boolean = false, lockStrokeWidth: boolean = false, style: PathStyle = defaultPathStyle()) {
        super();
        this.path = path;
        this._close = close;
        this._lockStrokeWidth = lockStrokeWidth;
        this.style = style;
    }

    public get path() {
        return this._path;
    }

    public set path(path: Vector3[]) {
        this._path = path;
    }

    public get style() {
        return this._style;
    }

    public set style(style: PathStyle) {
        this._style = style;
    }

    public get attributes(): Path3dAttributes {
        return {
            type: this.type,
            path: structuredClone(this._path),
            close: this._close,
            lockStrokeWidth: this._lockStrokeWidth,
            style: structuredClone(this._style),
        }
    }
}
