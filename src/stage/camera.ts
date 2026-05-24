import { BehaviorSubject } from 'rxjs';
import { ONE_DEGREE } from '../types/constants';
import { createDefaultPerspective, Perspective } from '../types/perspective';
import { Vector3 } from '../types/vector-3';

export class Camera {

    private _perspectivePreset: number = 0;

    private static readonly MIN_FOV = 10;
    private static readonly MAX_FOV = 150;

    public state$ = new BehaviorSubject<Perspective>(createDefaultPerspective());

    public get fov(): number {
        return this.state$.getValue().fov;
    }

    public get focalLength(): number {
        return 1.0 / Math.tan(this.fov * ONE_DEGREE / 2);
    }

    public get position(): Vector3 {
        return this.state$.getValue().position;
    }

    public get angleX(): number {
        return this.state$.getValue().angleX;
    }

    public get angleY(): number {
        return this.state$.getValue().angleY;
    }

    public get angleZ(): number {
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

    public increaseFov() {
        const newState = structuredClone(this.state$.getValue());
        if (newState.fov < Camera.MAX_FOV) {
            newState.fov++;
            this.state$.next(newState);
        }
    }

    public decreaseFov() {
        const newState = structuredClone(this.state$.getValue());
        if (newState.fov > Camera.MIN_FOV) {
            newState.fov--;
            this.state$.next(newState);
        }
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
            fov: 50,
        });
    }

    private perspectiveSide() {
        const distance = this.state$.getValue().position.z;
        this.state$.next({
            position: { x: 0, y: 0, z: distance },
            angleX: 0,
            angleY: -90 * ONE_DEGREE,
            angleZ: 0,
            fov: 50,
        });
    }

    private perspectiveTop() {
        const distance = this.state$.getValue().position.z;
        this.state$.next({
            position: { x: 0, y: 0, z: distance },
            angleX: 90 * ONE_DEGREE,
            angleY: 0,
            angleZ: 0,
            fov: 50,
        });
    }

    private perspectiveDimetric() {
        const distance = this.state$.getValue().position.z;
        this.state$.next({
            position: { x: 0, y: 0, z: distance },
            angleX: 45 * ONE_DEGREE,
            angleY: 45 * ONE_DEGREE,
            angleZ: 0,
            fov: 50,
        });
    }
}
