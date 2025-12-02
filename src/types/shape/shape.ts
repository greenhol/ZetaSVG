export enum ShapeType {
    CIRCLE = 'CIRCLE',
    RECTANGLE = 'RECTANGLE',
    PATH = 'PATH',
    TEXT = 'TEXT',
}

export abstract class Shape {
    public abstract id: string;
    public abstract type: ShapeType;

    private _dist: number = 0;
    private _visibility = true;

    public set dist(dist: number) {
        this._dist = dist;
    }

    public get dist(): number {
        return this._dist;
    }

    public get isVisible(): boolean {
        return this._visibility;
    }

    public set visible(visible: boolean) {
        this._visibility = visible;
    }
}
