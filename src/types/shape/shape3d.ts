import { ShapeType } from './shape';

export abstract class Shape3d<T> {

    abstract type: ShapeType;

    abstract attributes: T;
}
