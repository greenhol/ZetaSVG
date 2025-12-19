export enum ShapeType {
    GROUP = 'GROUP',
    CIRCLE = 'CIRCLE',
    RECTANGLE = 'RECTANGLE',
    PATH = 'PATH',
    TEXT = 'TEXT',
}

export abstract class Shape {
    public abstract id: string;
    public abstract type: ShapeType;

    private _dist: number = 0;
    private _index: number = 0; // optional - only used for group childs
    private _visible: boolean;
    private _inView: boolean;

    constructor(visible: boolean) {
        this._visible = visible;
    }

    public set dist(dist: number) {
        this._dist = dist;
    }

    public get dist(): number {
        return this._dist;
    }

    public set index(inxex: number) {
        this._index = inxex;
    }

    public get index(): number {
        return this._index;
    }

    public set visible(value: boolean) {
        this._visible = value;
    }

    public set inView(inView: boolean) {
        this._inView = inView;
    }

    public isHidden(): boolean {
        return !this._visible || !this._inView;
    }
}
