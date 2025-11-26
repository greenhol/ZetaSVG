import { BehaviorSubject, distinctUntilChanged, Observable } from 'rxjs';
import { ModuleConfig } from '../config/module-config';
import { Camera } from '../stage/camera';
import { createDefaultPerspective, Perspective } from '../types/perspective';
import { Circle3d, Circle3dAttributes } from '../types/shape/circle';
import { Path3d, Path3dAttributes } from '../types/shape/path';
import { Rectangle3d, Rectangle3dAttributes } from '../types/shape/rectangle';
import { Text3d, Text3dAttributes } from '../types/shape/text';
import { SerialSubscription } from '../utils/serial-subscription';
import { simpleDeepCompareEqual } from '../utils/simple-deep-compare';

export interface WorldState {
    circles: Circle3dAttributes[];
    paths: Path3dAttributes[];
    rectangles: Rectangle3dAttributes[];
    texts: Text3dAttributes[];
}

export interface WorldConfig {
    cameraPerspective: Perspective;
}

export abstract class World {

    private _t = 0;

    private _cameraSubscription = new SerialSubscription();

    protected circles: Circle3d[] = [];
    protected paths: Path3d[] = [];
    protected rectangles: Rectangle3d[] = [];
    protected texts: Text3d[] = [];

    private _state$ = new BehaviorSubject<WorldState>({
        circles: this.circles.map((circle: Circle3d) => circle.attributes),
        paths: this.paths.map((circle: Path3d) => circle.attributes),
        rectangles: this.rectangles.map((circle: Rectangle3d) => circle.attributes),
        texts: this.texts.map((circle: Text3d) => circle.attributes),
    });
    public state$: Observable<WorldState> = this._state$.pipe(
        distinctUntilChanged((a: WorldState, b: WorldState) => simpleDeepCompareEqual<WorldState>(a, b)),
        // tap((value: WorldState) => console.log("XXXXXXXXXXXXXXXXX new value")),
    );

    public config = new ModuleConfig<WorldConfig>({ cameraPerspective: createDefaultPerspective() });

    public backgroundColor: string = '#fff';

    public abstract name: string;

    abstract transitionToStateAt(t: number): void;

    public init() {
        this.emit();
    }

    public tick() {
        this._t++;
        this.transitionToStateAt(this._t);
        this.emit();
    }

    public mountCamera(camera: Camera) {
        camera.mountCamera(this.config.data.cameraPerspective);
        this._cameraSubscription.set(
            camera.state$.subscribe({
                next: (cameraPerspective) => {
                    this.config.data.cameraPerspective = cameraPerspective;
                }
            })
        );
    }

    public resetConfig(): void {
        this.config.reset();
    }

    public onDestroy(): void {
        this.config.save();
        this._cameraSubscription.unsubscribe();
    }

    private emit() {
        this._state$.next({
            circles: this.circles.map((circle: Circle3d) => circle.attributes),
            paths: this.paths.map((circle: Path3d) => circle.attributes),
            rectangles: this.rectangles.map((circle: Rectangle3d) => circle.attributes),
            texts: this.texts.map((circle: Text3d) => circle.attributes),
        });
    }
}
