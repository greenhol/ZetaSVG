export abstract class StyleBuilder<T> {
    public _style: T;

    public get(): T {
        return this._style;
    }
}