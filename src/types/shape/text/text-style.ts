import { StyleBuilder } from '../style-builder';
import { AlignmentBaseline } from './index';

export interface TextStyle {
    fontSize: number; // scales with distance (if lockFontSize false)
    fontFamily: string;
    fill: string;
    fillOpacity: number;
    alignmentBaseline: AlignmentBaseline;
}

class TextStyleBuilder extends StyleBuilder<TextStyle> {

    constructor() {
        super();
        this._style = {
            fontSize: 12,
            fontFamily: 'sans-serif',
            fill: '#666',
            fillOpacity: 1,
            alignmentBaseline: 'baseline',
        }
    }

    public fontSize(value: number): TextStyleBuilder {
        this._style.fontSize = value;
        return this;
    }

    public fontFamily(value: string): TextStyleBuilder {
        this._style.fontFamily = value;
        return this;
    }

    public fill(value: string): TextStyleBuilder {
        this._style.fill = value;
        return this;
    }

    public fillOpacity(value: number): TextStyleBuilder {
        this._style.fillOpacity = value;
        return this;
    }

    public alignmentBaseline(value: AlignmentBaseline): TextStyleBuilder {
        this._style.alignmentBaseline = value;
        return this;
    }
}

export function textStyle(): TextStyleBuilder {
    return new TextStyleBuilder();
}

export function defaultTextStyle(): TextStyle {
    return textStyle().get();
}