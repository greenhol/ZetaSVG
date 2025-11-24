import { SpaceCoord } from '../../space-coord';
import { Path3dAttributes, PathStyle } from './attributes';
import { Shape3d } from '../shape3d';
import { defaultStyle } from './attributes';

export class Path3d extends Shape3d<Path3dAttributes> {
    private _path: SpaceCoord[];
    private _close: boolean;
    private _style: PathStyle;

    constructor(path: SpaceCoord[], close: boolean = false, style: PathStyle = defaultStyle) {
        super();
        this.path = path;
        this.close = close;
        this.style = style;
    }

    public get path() {
        return this._path;
    }

    public set path(path: SpaceCoord[]) {
        this._path = path;
    }

    public get close() {
        return this._close;
    }

    public set close(close: boolean) {
        this._close = close;
    }

    public get style() {
        return this._style;
    }

    public set style(style: PathStyle) {
        this._style = style;
    }

    public get attributes(): Path3dAttributes {
        return {
            path: structuredClone(this._path),
            close: this._close,
            style: structuredClone(this._style),
        }
    }
}
