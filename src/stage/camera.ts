import { BehaviorSubject } from 'rxjs';
import { createDefaultPerspective, Perspective } from '../types/perspective';
import { ONE_DEGREE } from '../types/constants';

export class Camera {

    private _perspectivePreset: number = 0;

    public state$ = new BehaviorSubject<Perspective>(createDefaultPerspective());

    public get position() {
        return this.state$.getValue().position;
    }

    public get angleX() {
        return this.state$.getValue().angleX;
    }

    public get angleY() {
        return this.state$.getValue().angleY;
    }

    public get angleZ() {
        return this.state$.getValue().angleZ;
    }

    public moveX(value: number) {
        const newState = structuredClone(this.state$.getValue());
        newState.position.x += value;
        this.state$.next(newState);
    }

    public moveY(value: number) {
        const newState = structuredClone(this.state$.getValue());
        newState.position.y += value;
        this.state$.next(newState);
    }

    public moveZ(value: number) {
        const newState = structuredClone(this.state$.getValue());
        newState.position.z += value;
        this.state$.next(newState);
    }

    public rotateX(value: number) {
        const newState = structuredClone(this.state$.getValue());
        newState.angleX += value;
        this.state$.next(newState);
    }

    public rotateY(value: number) {
        const newState = structuredClone(this.state$.getValue());
        newState.angleY += value;
        this.state$.next(newState);
    }

    public rotateZ(value: number) {
        const newState = structuredClone(this.state$.getValue());
        newState.angleZ += value;
        this.state$.next(newState);
    }

    public mountCamera(perspective: Perspective) {
        const newState = structuredClone(perspective);
        this.resetPerspectivePreset();
        this.state$.next(newState);
    }

    public togglePerspective() {
        this._perspectivePreset++;
        switch (this._perspectivePreset) {
            case 1: this.perspectiveFront(); break;
            case 2: this.perspectiveSide(); break;
            case 3: this.perspectiveTop(); break;
            case 4: {
                this.perspectiveDimetric();
                this.resetPerspectivePreset();
                break;
            }
            default: {
                console.warn(`#togglePerspective - unexpected value ${this._perspectivePreset}`);
                this.resetPerspectivePreset();
                break;
            }
        }
    }

    private resetPerspectivePreset() {
        this._perspectivePreset = 0;
    }

    private perspectiveFront() {
        const distance = this.state$.getValue().position.z;
        this.state$.next({
            position: { x: 0, y: 0, z: distance },
            angleX: 0,
            angleY: 0,
            angleZ: 0,
        });
    }

    private perspectiveSide() {
        const distance = this.state$.getValue().position.z;
        this.state$.next({
            position: { x: 0, y: 0, z: distance },
            angleX: 0,
            angleY: -90 * ONE_DEGREE,
            angleZ: 0,
        });
    }

    private perspectiveTop() {
        const distance = this.state$.getValue().position.z;
        this.state$.next({
            position: { x: 0, y: 0, z: distance },
            angleX: 90 * ONE_DEGREE,
            angleY: 0,
            angleZ: 0,
        });
    }

    private perspectiveDimetric() {
        const distance = this.state$.getValue().position.z;
        this.state$.next({
            position: { x: 0, y: 0, z: distance },
            angleX: 45 * ONE_DEGREE,
            angleY: 45 * ONE_DEGREE,
            angleZ: 0,
        });
    }
}
