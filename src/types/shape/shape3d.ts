import { ShapeType } from './shape';

export interface Shape3dAttributes {
    visible: boolean;
}

export abstract class Shape3d<T> {

    abstract type: ShapeType;

    abstract attributes: T;

    private _visible: boolean;

    constructor(visible: boolean) {
        this._visible = visible;
    }

    public set visible(value: boolean) {
        this._visible = value;
    }

    public get visible(): boolean {
        return this._visible;
    }
}
