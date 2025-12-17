import { StyleBuilder } from '../style-builder';

export interface CircleStyle {
    strokeWidth: number; // scales with distance
    stroke: string;
    strokeOpacity: number;
    fill: string;
    fillOpacity: number;
}

class CircleStyleBuilder extends StyleBuilder<CircleStyle> {

    constructor() {
        super();
        this._style = {
            strokeWidth: 0.15,
            stroke: '#aaa',
            strokeOpacity: 1,
            fill: '#ddd',
            fillOpacity: 1,
        }
    }

    public strokeWidth(value: number): CircleStyleBuilder {
        this._style.strokeWidth = value;
        return this;
    }

    public stroke(value: string): CircleStyleBuilder {
        this._style.stroke = value;
        return this;
    }

    public strokeOpacity(value: number): CircleStyleBuilder {
        this._style.strokeOpacity = value;
        return this;
    }

    public fill(value: string): CircleStyleBuilder {
        this._style.fill = value;
        return this;
    }

    public fillOpacity(value: number): CircleStyleBuilder {
        this._style.fillOpacity = value;
        return this;
    }
}

export function circleStyle(): CircleStyleBuilder {
    return new CircleStyleBuilder();
}

export function defaultCircleStyle(): CircleStyle {
    return circleStyle().get();
}