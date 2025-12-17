import { Vector3 } from '../../vector-3';
import { ShapeType } from '../shape';

export type AlignmentBaseline = 'auto' | 'baseline' | 'before-edge' | 'text-before-edge' | 'middle' | 'central' | 'after-edge' | 'text-after-edge' | 'ideographic' | 'alphabetic' | 'hanging' | 'mathematical' | 'top' | 'center' | 'bottom';

export interface Text3dAttributes {
    type: ShapeType,
    position: Vector3,
    text: string,
    lockFontSize: boolean,
    style: TextStyle,
}

export interface TextStyle {
    fontSize: number; // scales with distance (if lockFontSize false)
    fontFamily: string;
    fill: string;
    fillOpacity: number;
    alignmentBaseline: AlignmentBaseline;
}

export function createDefaultStyle(): TextStyle {
    return {
        fontSize: 12,
        fontFamily: 'sans-serif',
        fill: '#666',
        fillOpacity: 1,
        alignmentBaseline: 'baseline',
    }
}

export interface TextAttr {
    x: number,
    y: number,
    fontSize: number;
    text: string;
}
