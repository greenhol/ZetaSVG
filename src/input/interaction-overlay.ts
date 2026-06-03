import { Observable, Subject } from 'rxjs';

export interface DragDelta {
    dx: number;
    dy: number;
}

type DragMode = 'drag' | 'pan' | null;

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
    private _dragMode: DragMode = null;
    private _lastX = 0;
    private _lastY = 0;
    private _lastMidX = 0;
    private _lastMidY = 0;
    private _lastPinchDistance = 0;
    private _activePointers = new Set<number>();
    private _pointerPositions = new Map<number, { x: number, y: number; }>();

    private readonly WHEEL_STEP = 15;

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
        this._overlay.addEventListener('contextmenu', (e) => { e.preventDefault(); });
        this._overlay.addEventListener('wheel', (e) => { this.handleWheel(e); }, { passive: false });
    }

    private handleWheel(e: WheelEvent) {
        e.preventDefault();
        if (Math.abs(e.deltaY) < 50) return;
        this._pinch$.next(e.deltaY > 0 ? -this.WHEEL_STEP : this.WHEEL_STEP);
    }

    private handlePointerDown(e: PointerEvent) {
        if (this._dragMode !== null && this.isMouseEvent(e)) return;

        this._activePointers.add(e.pointerId);
        this._pointerPositions.set(e.pointerId, { x: e.clientX, y: e.clientY });

        if (this._activePointers.size > 2) {
            this.stopAll(e);
            return;
        }

        this._overlay.setPointerCapture(e.pointerId);
        this._overlay.style.cursor = 'none';

        if (this._activePointers.size === 1) {
            this.initSinglePointer(e);
        } else if (this._activePointers.size === 2) {
            this.initTwoPointers();
        }
    }

    private initSinglePointer(e: PointerEvent) {
        this._dragMode = this.isMouseEvent(e) ? this.mouseButtonToDragMode(e.button) : 'drag';
        if (this._dragMode === null) return;
        this._isDragging = true;
        this._lastX = e.clientX;
        this._lastY = e.clientY;
    }

    private initTwoPointers() {
        this._isDragging = false;
        this._dragMode = 'pan';
        const [p1, p2] = this.getPointerPositions();
        this._lastMidX = (p1.x + p2.x) / 2;
        this._lastMidY = (p1.y + p2.y) / 2;
        this._lastPinchDistance = this.getDistance(p1, p2);
    }

    private handlePointerMove(e: PointerEvent) {
        this._pointerPositions.set(e.pointerId, { x: e.clientX, y: e.clientY });

        if (this._activePointers.size === 1) {
            this.handleSinglePointerMove(e);
        } else if (this._activePointers.size === 2) {
            this.handleTwoPointerMove();
        }
    }

    private handleSinglePointerMove(e: PointerEvent) {
        if (!this._isDragging) return;
        const delta = this.computeDelta(e.clientX, e.clientY, this._lastX, this._lastY);
        this._lastX = e.clientX;
        this._lastY = e.clientY;
        if (!this.isZeroDelta(delta)) {
            this._dragMode === 'drag' ? this._drag$.next(delta) : this._pan$.next(delta);
        }
    }

    private handleTwoPointerMove() {
        const [p1, p2] = this.getPointerPositions();

        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        const panDelta = this.computeDelta(midX, midY, this._lastMidX, this._lastMidY);
        this._lastMidX = midX;
        this._lastMidY = midY;
        if (!this.isZeroDelta(panDelta)) {
            this._pan$.next(panDelta);
        }

        const distance = this.getDistance(p1, p2);
        const pinchDelta = distance - this._lastPinchDistance;
        this._lastPinchDistance = distance;
        if (pinchDelta !== 0) {
            this._pinch$.next(pinchDelta);
        }
    }

    private stopAll(e: PointerEvent) {
        this._activePointers.delete(e.pointerId);
        this._pointerPositions.delete(e.pointerId);
        this._isDragging = false;
        this._dragMode = null;
        this._overlay.releasePointerCapture(e.pointerId);
        this._overlay.style.cursor = '';

        if (this._activePointers.size === 1) {
            const [p] = this.getPointerPositions();
            this._lastX = p.x;
            this._lastY = p.y;
            this._isDragging = true;
            this._dragMode = 'drag';
        }
    }

    private mouseButtonToDragMode(button: number): DragMode {
        if (button === 0) return 'drag';
        if (button === 1 || button === 2) return 'pan';
        return null;
    }

    private isMouseEvent(e: PointerEvent): boolean {
        return e.pointerType === 'mouse';
    }

    private computeDelta(x: number, y: number, lastX: number, lastY: number): DragDelta {
        return { dx: x - lastX, dy: y - lastY };
    }

    private isZeroDelta(delta: DragDelta): boolean {
        return delta.dx === 0 && delta.dy === 0;
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
