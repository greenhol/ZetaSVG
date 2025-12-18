import { StyleBuilder } from '../style-builder';
import { StrokeLinecap, StrokeLinejoin } from '../style-types';

export interface PathStyle {
    strokeWidth: number; // scales with distance (if lockStrokeWidth false)
    stroke: string;
    strokeOpacity: number;
    strokeLinecap: StrokeLinecap;
    strokeLinejoin: StrokeLinejoin;
}

class PathStyleBuilder extends StyleBuilder<PathStyle> {

    constructor() {
        super();
        this._style = {
            strokeWidth: 1.5,
            stroke: '#aaa',
            strokeOpacity: 1,
            strokeLinecap: 'butt',
            strokeLinejoin: 'miter',
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

    public strokeLinecap(value: StrokeLinecap): PathStyleBuilder {
        this._style.strokeLinecap = value;
        return this;
    }

    public strokeLinejoin(value: StrokeLinejoin): PathStyleBuilder {
        this._style.strokeLinejoin = value;
        return this;
    }
}

export function pathStyle(): PathStyleBuilder {
    return new PathStyleBuilder();
}

export function defaultPathStyle(): PathStyle {
    return pathStyle().get();
}