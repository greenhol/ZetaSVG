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

    private _pan$ = new Subject<DragDelta>();
    public pan$: Observable<DragDelta> = this._pan$;

    private _pinch$ = new Subject<number>();
    public pinch$: Observable<number> = this._pinch$;

    private _isDragging = false;
    private _lastX = 0;
    private _lastY = 0;
    private _lastMidX = 0;
    private _lastMidY = 0;
    private _lastPinchDistance = 0;
    private _activePointers = new Set<number>();
    private _pointerPositions = new Map<number, { x: number, y: number; }>();

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
        this._overlay.addEventListener('pointerup', (e) => { this.stopAll(e); });
        this._overlay.addEventListener('pointercancel', (e) => { this.stopAll(e); });
    }

    private handlePointerDown(e: PointerEvent) {
        this._activePointers.add(e.pointerId);
        this._pointerPositions.set(e.pointerId, { x: e.clientX, y: e.clientY });

        if (this._activePointers.size > 2) {
            this.stopAll(e);
            return;
        }

        if (this._activePointers.size === 1) {
            this._isDragging = true;
            this._lastX = e.clientX;
            this._lastY = e.clientY;
            this._overlay.setPointerCapture(e.pointerId);
            this._overlay.style.cursor = 'none';
        } else if (this._activePointers.size === 2) {
            this._isDragging = false;
            this._overlay.style.cursor = 'none';
            this._overlay.setPointerCapture(e.pointerId);
            const [p1, p2] = this.getPointerPositions();
            this._lastMidX = (p1.x + p2.x) / 2;
            this._lastMidY = (p1.y + p2.y) / 2;
            this._lastPinchDistance = this.getDistance(p1, p2);
        }
    }

    private handlePointerMove(e: PointerEvent) {
        this._pointerPositions.set(e.pointerId, { x: e.clientX, y: e.clientY });

        if (this._activePointers.size === 1) {
            if (!this._isDragging) return;
            const dx = e.clientX - this._lastX;
            const dy = e.clientY - this._lastY;
            this._lastX = e.clientX;
            this._lastY = e.clientY;
            if (dx !== 0 || dy !== 0) {
                this._drag$.next({ dx, dy });
            }
        } else if (this._activePointers.size === 2) {
            const [p1, p2] = this.getPointerPositions();

            const midX = (p1.x + p2.x) / 2;
            const midY = (p1.y + p2.y) / 2;
            const dx = midX - this._lastMidX;
            const dy = midY - this._lastMidY;
            this._lastMidX = midX;
            this._lastMidY = midY;
            if (dx !== 0 || dy !== 0) {
                this._pan$.next({ dx, dy });
            }

            const distance = this.getDistance(p1, p2);
            const pinchDelta = distance - this._lastPinchDistance;
            this._lastPinchDistance = distance;
            if (pinchDelta !== 0) {
                this._pinch$.next(pinchDelta);
            }
        }
    }

    private stopAll(e: PointerEvent) {
        this._activePointers.delete(e.pointerId);
        this._pointerPositions.delete(e.pointerId);
        this._isDragging = false;
        this._overlay.releasePointerCapture(e.pointerId);
        this._overlay.style.cursor = '';

        // if one finger remains, re-initialize single finger state
        if (this._activePointers.size === 1) {
            const [p] = this.getPointerPositions();
            this._lastX = p.x;
            this._lastY = p.y;
            this._isDragging = true;
        }
    }

    private getPointerPositions(): { x: number, y: number; }[] {
        return Array.from(this._pointerPositions.values());
    }

    private getDistance(p1: { x: number, y: number; }, p2: { x: number, y: number; }): number {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
}
