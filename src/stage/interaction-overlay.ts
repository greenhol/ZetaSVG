import { Observable, Subject } from 'rxjs';

export interface DragDelta {
    dx: number;
    dy: number;
}

export class InteractionOverlay {

    private _overlay: HTMLDivElement;
    private _width: number;
    private _height: number;

    private _drag$ = new Subject<DragDelta>();
    public drag$: Observable<DragDelta> = this._drag$;

    private _isDragging = false;
    private _lastX = 0;
    private _lastY = 0;
    private _activePointers = new Set<number>();

    constructor(divId: string) {
        const elem = document.getElementById(divId);
        this._width = elem?.clientWidth ?? 0;
        this._height = elem?.clientHeight ?? 0;

        this._overlay = document.createElement('div');
        this._overlay.style.position = 'absolute';
        this._overlay.style.top = '0';
        this._overlay.style.left = '0';
        this._overlay.style.width = `${this._width}px`;
        this._overlay.style.height = `${this._height}px`;
        this._overlay.style.touchAction = 'none';
        elem?.append(this._overlay);

        this.registerEvents();
    }

    public get height(): number {
        return this._height;
    }

    private registerEvents() {
        this._overlay.addEventListener('pointerdown', (e) => { this.handlePointerDown(e); });
        this._overlay.addEventListener('pointermove', (e) => { this.handlePointerMove(e); });
        this._overlay.addEventListener('pointerup', (e) => { this.stopDrag(e); });
        this._overlay.addEventListener('pointercancel', (e) => { this.stopDrag(e); });
    }

    private handlePointerDown(e: PointerEvent) {
        this._activePointers.add(e.pointerId);
        if (this._activePointers.size > 1) {
            this.stopDrag(e);
            return;
        }
        this._isDragging = true;
        this._lastX = e.clientX;
        this._lastY = e.clientY;
        this._overlay.setPointerCapture(e.pointerId);
        this._overlay.style.cursor = 'none';
    }

    private handlePointerMove(e: PointerEvent) {
        if (!this._isDragging) return;

        const dx = e.clientX - this._lastX;
        const dy = e.clientY - this._lastY;
        this._lastX = e.clientX;
        this._lastY = e.clientY;

        if (dx !== 0 || dy !== 0) {
            this._drag$.next({ dx, dy });
        }
    }

    private stopDrag(e: PointerEvent) {
        this._activePointers.delete(e.pointerId);
        if (!this._isDragging) return;
        this._isDragging = false;
        this._overlay.releasePointerCapture(e.pointerId);
        this._overlay.style.cursor = '';
    };
}
