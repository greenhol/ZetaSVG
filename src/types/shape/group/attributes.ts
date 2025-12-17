import { Vector3 } from '../../vector-3';
import { Circle, Circle3dAttributes } from '../circle';
import { Path, Path3dAttributes } from '../path';
import { ShapeType } from '../shape';

export enum SortBy {
    DISTANCE = 'DISTANCE',
    INDEX = 'INDEX',
}

export interface Group3dAttributes {
    type: ShapeType,
    position: Vector3,
    children: (Circle3dAttributes | Path3dAttributes)[],
    sortBy: SortBy,
}

export interface GroupAttr {
    children: GroupChild[],
    sortBy: SortBy,
}

export interface GroupChild {
    child: Circle | Path,
    index: number,
}
