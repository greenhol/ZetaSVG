import { Vector3 } from '../../vector-3';
import { ShapeType } from '../shape';
import { TextStyle } from './index';

export type AlignmentBaseline = 'auto' | 'baseline' | 'before-edge' | 'text-before-edge' | 'middle' | 'central' | 'after-edge' | 'text-after-edge' | 'ideographic' | 'alphabetic' | 'hanging' | 'mathematical' | 'top' | 'center' | 'bottom';

export interface Text3dAttributes {
    type: ShapeType,
    position: Vector3,
    text: string,
    lockFontSize: boolean,
    style: TextStyle,
}

export interface TextAttr {
    x: number,
    y: number,
    fontSize: number;
    text: string;
}
