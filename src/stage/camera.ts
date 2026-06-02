import { BehaviorSubject, distinctUntilChanged } from 'rxjs';
import { ONE_DEGREE } from '../types/constants';
import { CameraType, Perspective } from '../types/perspective';
import { Vector3 } from '../types/vector-3';
import { simpleDeepCompareEqual } from '../utils/simple-deep-compare';

export class Camera {

    private static readonly MIN_FOV = 10;
    private static readonly MAX_FOV = 150;

    private _perspectivePreset: number = 0;
    private _movementStrategy: MovementStrategy;

    private _state$ = new BehaviorSubject<Perspective>(Perspective.dimetric());
    public state$ = this._state$.pipe(
        distinctUntilChanged((a: Perspective, b: Perspective) => simpleDeepCompareEqual<Perspective>(a, b))
    );

    constructor() {
        this.checkCameraType();
    }

    public get position(): Vector3 {
        return this._state$.getValue().position;
    }

    public get distance(): number {
        return this._movementStrategy.getDistance(this.position);
    }

    public get angleX(): number {
        return this._state$.getValue().angleX;
    }

    public get angleY(): number {
        return this._state$.getValue().angleY;
    }

    public get angleZ(): number {
        return this._state$.getValue().angleZ;
    }

    public get fovRadians(): number {
        return this._state$.getValue().fov * ONE_DEGREE;
    }

    public get focalLength(): number {
        return 1.0 / Math.tan(this.fovRadians / 2);
    }

    public get type(): CameraType {
        return this._state$.getValue().type;
    }

    public moveDepth(distance: number) {
        this._state$.next(this._movementStrategy.moveDepth(this._state$.getValue(), distance));
    }

    public moveHorizontal(distance: number) {
        this._state$.next(this._movementStrategy.moveHorizontal(this._state$.getValue(), distance));
    }

    public moveVertical(distance: number) {
        this._state$.next(this._movementStrategy.moveVertical(this._state$.getValue(), distance));
    }

    public pitch(angle: number) {
        this._state$.next(this._movementStrategy.pitch(this._state$.getValue(), angle));
    }

    public yaw(angle: number) {
        this._state$.next(this._movementStrategy.yaw(this._state$.getValue(), angle));
    }

    public roll(angle: number) {
        this._state$.next(this._movementStrategy.roll(this._state$.getValue(), angle));
    }

    public increaseFov() {
        const newState = structuredClone(this._state$.getValue());
        if (newState.fov < Camera.MAX_FOV) {
            newState.fov++;
            this._state$.next(newState);
        }
    }

    public decreaseFov() {
        const newState = structuredClone(this._state$.getValue());
        if (newState.fov > Camera.MIN_FOV) {
            newState.fov--;
            this._state$.next(newState);
        }
    }

    public mountCamera(perspective: Perspective) {
        const newState = structuredClone(perspective);
        this.resetPerspectivePreset();
        this._state$.next(newState);
        this.checkCameraType();
    }

    public togglePerspective() {
        this._perspectivePreset++;
        switch (this._perspectivePreset) {
            case 1: this._state$.next(Perspective.freeFly()); break;
            case 2: this._state$.next(Perspective.front()); break;
            case 3: this._state$.next(Perspective.top()); break;
            case 4: {
                this._state$.next(Perspective.dimetric());
                this.resetPerspectivePreset();
                break;
            }
            default: {
                console.warn(`#togglePerspective - unexpected value ${this._perspectivePreset}`);
                this.resetPerspectivePreset();
                break;
            }
        }
        this.checkCameraType();
    }

    private checkCameraType() {
        const desiredCameraType = this._state$.getValue().type;
        if (this._movementStrategy === undefined || this._movementStrategy.type != desiredCameraType) {
            console.log(`#checkCameraType - switching to camera type ${desiredCameraType}`);
            this._movementStrategy = (desiredCameraType === 'Orbit')
                ? new OrbitCameraMovement()
                : new FreeFlyCameraMovement();
        }
    }

    private resetPerspectivePreset() {
        this._perspectivePreset = 0;
    }
}

interface MovementStrategy {
    type: CameraType;
    getDistance(position: Vector3): number;
    moveDepth(state: Perspective, distance: number): Perspective;
    moveHorizontal(state: Perspective, distance: number): Perspective;
    moveVertical(state: Perspective, distance: number): Perspective;
    pitch(state: Perspective, angle: number): Perspective;
    yaw(state: Perspective, angle: number): Perspective;
    roll(state: Perspective, angle: number): Perspective;
}

class OrbitCameraMovement implements MovementStrategy {

    public type: CameraType = 'Orbit';

    public getDistance(position: Vector3): number {
        return Vector3.abs(position);
    }

    public moveDepth(state: Perspective, distance: number): Perspective {
        const newState = Perspective.deepClone(state);
        newState.position.z += distance;
        return newState;
    }

    public moveHorizontal(state: Perspective, distance: number): Perspective {
        const newState = Perspective.deepClone(state);
        newState.position.x += distance;
        return newState;
    }

    public moveVertical(state: Perspective, distance: number): Perspective {
        const newState = Perspective.deepClone(state);
        newState.position.y += distance;
        return newState;

    }

    public pitch(state: Perspective, angle: number): Perspective {
        const newState = Perspective.deepClone(state);
        newState.angleX += angle;
        return newState;

    }

    public yaw(state: Perspective, angle: number): Perspective {
        const newState = Perspective.deepClone(state);
        newState.angleY += angle;
        return newState;
    }

    public roll(state: Perspective, angle: number): Perspective {
        const newState = Perspective.deepClone(state);
        newState.angleZ += angle;
        return newState;
    }
}

class FreeFlyCameraMovement implements MovementStrategy {

    private static readonly CLAMP_ANGLE_X = 80 * ONE_DEGREE;
    private static readonly CAMERA_MOVEMENT_SPEED = 5;

    public type: CameraType = 'FreeFly';

    public getDistance(position: Vector3): number {
        return FreeFlyCameraMovement.CAMERA_MOVEMENT_SPEED;
    }

    public moveDepth(state: Perspective, distance: number): Perspective {
        const newState = Perspective.deepClone(state);
        const traverse: Vector3 = Vector3.scalarMultiply(distance, {
            x: Math.cos(newState.angleZ) * Math.sin(newState.angleY) * Math.cos(newState.angleX) + Math.sin(newState.angleZ) * Math.sin(newState.angleX),
            y: Math.sin(newState.angleZ) * Math.sin(newState.angleY) * Math.cos(newState.angleX) - Math.cos(newState.angleZ) * Math.sin(newState.angleX),
            z: Math.cos(newState.angleY) * Math.cos(newState.angleX),
        });
        newState.position.x += traverse.x;
        newState.position.y += traverse.y;
        newState.position.z += traverse.z;
        return newState;
    }

    public moveHorizontal(state: Perspective, distance: number): Perspective {
        const newState = Perspective.deepClone(state);
        const traverse: Vector3 = Vector3.scalarMultiply(distance, {
            x: Math.cos(newState.angleZ) * Math.cos(newState.angleY),
            y: Math.sin(newState.angleZ) * Math.cos(newState.angleY),
            z: -Math.sin(newState.angleY),
        });
        newState.position.x += traverse.x;
        newState.position.y += traverse.y;
        newState.position.z += traverse.z;
        return newState;
    }

    public moveVertical(state: Perspective, distance: number): Perspective {
        const newState = Perspective.deepClone(state);
        const traverse: Vector3 = Vector3.scalarMultiply(distance, {
            x: Math.cos(newState.angleZ) * Math.sin(newState.angleY) * Math.sin(newState.angleX) - Math.sin(newState.angleZ) * Math.cos(newState.angleX),
            y: Math.sin(newState.angleZ) * Math.sin(newState.angleY) * Math.sin(newState.angleX) + Math.cos(newState.angleZ) * Math.cos(newState.angleX),
            z: Math.cos(newState.angleY) * Math.sin(newState.angleX),
        });
        newState.position.x += traverse.x;
        newState.position.y += traverse.y;
        newState.position.z += traverse.z;
        return newState;
    }

    public pitch(state: Perspective, angle: number): Perspective {
        const newState = Perspective.deepClone(state);
        const newAngleX = Math.min(Math.max(-FreeFlyCameraMovement.CLAMP_ANGLE_X, newState.angleX - angle), FreeFlyCameraMovement.CLAMP_ANGLE_X);
        newState.angleX = newAngleX;
        return newState;
    }

    public yaw(state: Perspective, angle: number): Perspective {
        const newState = Perspective.deepClone(state);
        newState.angleY -= angle;
        return newState;
    }

    public roll(state: Perspective, angle: number): Perspective {
        const newState = Perspective.deepClone(state);
        newState.angleZ += angle;
        return newState;
    }
}
