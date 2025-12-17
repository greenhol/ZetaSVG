import { Observable, ReplaySubject } from 'rxjs';
import { idGenerator } from '../../utils/unique';
import { Circle } from './circle';
import { Group } from './group';
import { Path } from './path';
import { Rectangle } from './rectangle';
import { Text } from './text';

export interface Collection {
    groups: Group[];
    circles: Circle[];
    paths: Path[];
    rectangles: Rectangle[];
    texts: Text[];
}

export class Shapes {

    id: string;

    private _collection: Collection;
    private _collection$ = new ReplaySubject<Collection>(1);
    collection$: Observable<Collection> = this._collection$;

    constructor(name: string, collection: Collection) {
        this.id = idGenerator.newId(name);
        this._collection = collection;
        this.emitList();
    }

    update(callback: (data: Collection) => void) {
        callback(this._collection);
        this.emitList();
    }

    private emitList() {
        this._collection$.next(this._collection);
    }
}