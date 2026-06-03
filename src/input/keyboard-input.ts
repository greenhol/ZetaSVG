import { Observable, Subject } from 'rxjs';

export interface MoveDelta {
    dx: number;
    dy: number;
    dz: number;
}

export interface RotationDelta {
    dPitch: number;
    dYaw: number;
    dRoll: number;
}

export class KeyboardInput {

    private _move$ = new Subject<MoveDelta>();
    public move$: Observable<MoveDelta> = this._move$;

    private _rotation$ = new Subject<RotationDelta>();
    public rotation$: Observable<RotationDelta> = this._rotation$;

    private _fov$ = new Subject<number>();
    public fov$: Observable<number> = this._fov$;

    private _action$ = new Subject<string>();
    public action$: Observable<string> = this._action$;

    private _isRunning = false;
    private _pressedKeys = new Set<string>();

    private _velDx = 0;
    private _velDy = 0;
    private _velDz = 0;
    private _velPitch = 0;
    private _velYaw = 0;
    private _velRoll = 0;
    private _velFov = 0;
    private _fovAccumulator = 0;

    private _lastTick = performance.now();

    private readonly ACCELERATION = 20;
    private readonly DECELERATION = 20;
    private readonly MAX_SPEED = 3;

    private readonly ACTION_KEYS = new Set<string>(['Escape', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'o', 'v']);

    private readonly CONTINOUS_KEYS = new Set<string>(['w', 'a', 's', 'd', 'r', 'f', ',', '.', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', '+', '-']);

    public onKeyDown(eventKey: string) {
        if (!this.CONTINOUS_KEYS.has(eventKey)) return;
        this._pressedKeys.add(eventKey);
        if (!this._isRunning) {
            this._isRunning = true;
            this._lastTick = performance.now();
            requestAnimationFrame(() => this.tick());
        }
    }

    public onKeyUp(eventKey: string) {
        if (this.ACTION_KEYS.has(eventKey)) {
            this._action$.next(eventKey);
            return;
        }
        this._pressedKeys.delete(eventKey);
    }

    private tick() {
        const now = performance.now();
        const deltaTime = (now - this._lastTick) / 1000;
        this._lastTick = now;

        this._velDx = this.updateVelocity(this._velDx, this.getAxis('a', 'd'), deltaTime);
        this._velDy = this.updateVelocity(this._velDy, this.getAxis('f', 'r'), deltaTime);
        this._velDz = this.updateVelocity(this._velDz, this.getAxis('w', 's'), deltaTime);
        this._velPitch = this.updateVelocity(this._velPitch, this.getAxis('ArrowUp', 'ArrowDown'), deltaTime);
        this._velYaw = this.updateVelocity(this._velYaw, this.getAxis('ArrowLeft', 'ArrowRight'), deltaTime);
        this._velRoll = this.updateVelocity(this._velRoll, this.getAxis(',', '.'), deltaTime);
        this._velFov = this.updateVelocity(this._velFov, this.getAxis('-', '+'), deltaTime);
        this._fovAccumulator += 5 * this._velFov * deltaTime;

        if (this._velDx !== 0 || this._velDy !== 0 || this._velDz !== 0) {
            this._move$.next({
                dx: this._velDx * deltaTime,
                dy: this._velDy * deltaTime,
                dz: this._velDz * deltaTime
            });
        }

        if (this._velPitch !== 0 || this._velYaw !== 0 || this._velRoll !== 0) {
            this._rotation$.next({
                dPitch: this._velPitch * deltaTime,
                dYaw: this._velYaw * deltaTime,
                dRoll: this._velRoll * deltaTime,
            });
        }

        const steps = Math.trunc(this._fovAccumulator);
        if (steps !== 0) {
            this._fov$.next(steps);
            this._fovAccumulator -= steps;
        }

        const allStopped = this._velDx === 0 && this._velDy === 0 && this._velDz === 0 && this._velPitch === 0 && this._velYaw === 0 && this._velRoll === 0 && this._velFov === 0;

        if (allStopped) {
            this._isRunning = false;
        } else {
            requestAnimationFrame(() => this.tick());
        }
    }

    private getAxis(negKey: string, posKey: string): number {
        const neg = this._pressedKeys.has(negKey) ? -1 : 0;
        const pos = this._pressedKeys.has(posKey) ? 1 : 0;
        return neg + pos;
    }

    private updateVelocity(current: number, target: number, deltaTime: number): number {
        const rate = target !== 0 ? this.ACCELERATION : this.DECELERATION;
        const diff = target * this.MAX_SPEED - current;
        const step = rate * deltaTime;

        if (Math.abs(diff) <= step) return target * this.MAX_SPEED;
        return current + Math.sign(diff) * step;
    }
}