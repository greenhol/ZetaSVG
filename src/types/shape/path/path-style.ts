import { StyleBuilder } from '../style-builder';

export interface PathStyle {
    strokeWidth: number; // scales with distance (if lockStrokeWidth false)
    stroke: string;
    strokeOpacity: number;
}

class PathStyleBuilder extends StyleBuilder<PathStyle> {

    constructor() {
        super();
        this._style = {
            strokeWidth: 1.5,
            stroke: '#aaa',
            strokeOpacity: 1,
        }
    }

    public strokeWidth(value: number): PathStyleBuilder {
        this._style.strokeWidth = value;
        return this;
    }

    public stroke(value: string): PathStyleBuilder {
        this._style.stroke = value;
        return this;
    }

    public strokeOpacity(value: number): PathStyleBuilder {
        this._style.strokeOpacity = value;
        return this;
    }
}

export function pathStyle(): PathStyleBuilder {
    return new PathStyleBuilder();
}

export function defaultPathStyle(): PathStyle {
    return pathStyle().get();
}