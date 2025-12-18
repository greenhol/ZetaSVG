import { StyleBuilder } from '../style-builder';
import { StrokeLinejoin } from '../style-types';

export interface RectangleStyle {
    strokeWidth: number; // scales with distance
    stroke: string;
    strokeOpacity: number;
    strokeLinejoin: StrokeLinejoin;
    fill: string;
    fillOpacity: number;
}

class RectangleStyleBuilder extends StyleBuilder<RectangleStyle> {

    constructor() {
        super();
        this._style = {
            strokeWidth: 1.5,
            stroke: '#aaa',
            strokeOpacity: 1,
            strokeLinejoin: 'miter',
            fill: '#ddd',
            fillOpacity: 1,
        }
    }

    public strokeWidth(value: number): RectangleStyleBuilder {
        this._style.strokeWidth = value;
        return this;
    }

    public stroke(value: string): RectangleStyleBuilder {
        this._style.stroke = value;
        return this;
    }

    public strokeOpacity(value: number): RectangleStyleBuilder {
        this._style.strokeOpacity = value;
        return this;
    }

    public strokeLinejoin(value: StrokeLinejoin): RectangleStyleBuilder {
        this._style.strokeLinejoin = value;
        return this;
    }

    public fill(value: string): RectangleStyleBuilder {
        this._style.fill = value;
        return this;
    }

    public fillOpacity(value: number): RectangleStyleBuilder {
        this._style.fillOpacity = value;
        return this;
    }
}

export function rectangleStyle(): RectangleStyleBuilder {
    return new RectangleStyleBuilder();
}

export function defaultRectangleStyle(): RectangleStyle {
    return rectangleStyle().get();
}
