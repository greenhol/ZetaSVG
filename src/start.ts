import { BehaviorSubject, interval, Subject, takeUntil, timer } from 'rxjs';
import { configVersionCheck } from './config/config-version-check';
import { ModuleConfig } from './config/module-config';
import { Camera } from './stage/camera';
import { CameraKeyboardConnector, KeyboardAnimationManager } from './stage/cameraKeyboardConnector';
import { Projector } from './stage/projector';
import { Stage } from './stage/stage';
import { evaluateStageProperties, StageMode, stageModeHeight, stageModeWidth } from './stage/stage-mode';
import { perspectiveToString } from './types/perspective';
import { longPressHandler } from './utils/long-press-handler';
import { SerialSubscription } from './utils/serial-subscription';
import { BellCurve } from './world/bell-curve';
import { BouncingParticles } from './world/bouncing-particles';
import { DoublePendulum2d } from './world/double-pendulum-2d';
import { DoublePendulum3d } from './world/double-pendulum-3d';
import { Grid } from './world/grid';
import { HilbertCurve } from './world/hilbert-curve';
import { Playground } from './world/playground';
import { RandomPoints } from './world/random-points';
import { RichtersRectangles } from './world/richters-rectangles';
import { SolarSystem } from './world/solar-system';
import { World } from './world/world';

declare const APP_VERSION: string;

interface MainConfig {
    currentWorldId: number,
    worldTick: number,
}

export class Start {

    private _config: ModuleConfig<MainConfig>;

    private _stage: Stage;
    private _stageMode: StageMode;
    private _camera: Camera;
    private _world: World | null;

    private _cameraControl: CameraKeyboardConnector;
    private _keyboardAnimationManager = new KeyboardAnimationManager();

    private _currentWorldId$: BehaviorSubject<number>;
    private _abortWorldTick$ = new Subject<void>();
    private _newWorldSubscription = new SerialSubscription();
    private _currentWorldIdSubscriontion = new SerialSubscription();

    private _worldTitleArea = document.getElementById("worldTitle");
    private _cameraInfoArea = document.getElementById("cameraInfo");

    constructor() {
        console.log(`#constructor(Start) - ZetaSVG - Version: ${APP_VERSION}`);
        configVersionCheck(APP_VERSION);
        this._stageMode = evaluateStageProperties();

        const mainDiv = document.getElementById('main');
        if (mainDiv == null) {
            console.error("Critical: Main div element not found");
            return;
        }
        this.setupStage(mainDiv);

        this._stage = new Stage('main');
        this._camera = new Camera();
        this._cameraControl = new CameraKeyboardConnector(this._camera);
        this._world = null;

        this._config = new ModuleConfig<MainConfig>({ currentWorldId: 1, worldTick: 40 }, "mainConfig");
        this._currentWorldId$ = new BehaviorSubject<number>(this._config.data.currentWorldId);

        const isImmersive = this._stageMode == StageMode.IMMERSIVE;
        this.handlePhysicalKeyboardEvents(!isImmersive);
        if (!isImmersive) {
            this.appendVirtualKeyboard();
            this.updateCameraInfo();
        }
        this.runWorld();
    }

    private setupStage(mainDiv: HTMLElement) {
        const infoDiv = document.getElementById('info');
        const keyboardDiv = document.getElementById('virtual-keyboard-container');
        switch (this._stageMode) {
            case StageMode.DEFAULT: {
                mainDiv.classList.add('main--default');
                infoDiv?.classList.add('info--default');
                break;
            }
            case StageMode.SMALL: {
                mainDiv.classList.add('main--small');
                infoDiv?.classList.add('info--small');
                break;
            }
            case StageMode.IMMERSIVE: {
                console.log("Fullscreen detected - going immersive!");
                mainDiv.classList.add('main--immersive');
                infoDiv?.classList.add('element--gone');
                keyboardDiv?.classList.add('element--gone');
                break;
            }
        }

        window.addEventListener('resize', () => {
            const newStageMode = evaluateStageProperties();
            if (newStageMode !== this._stageMode) {
                window.location.reload();
            }
        });
    }

    private handlePhysicalKeyboardEvents(signalToVirtualKeyboard: Boolean) {
        if (signalToVirtualKeyboard) {
            document.addEventListener(
                "keydown",
                (event) => {
                    this.signalPhysicalEventToVirtualKeyboard(event.key);
                    this.handleKeyPress(event.key);
                },
                false,
            );
        } else {
            document.addEventListener(
                "keydown",
                (event) => { this.handleKeyPress(event.key) },
                false,
            );
        }
    }

    private appendVirtualKeyboard() {
        fetch('virtual-keyboard.html')
            .then(response => response.text())
            .then(html => {
                const virtualKeyboardContainer = document.getElementById('virtual-keyboard-container');
                if (virtualKeyboardContainer != null) {
                    virtualKeyboardContainer.innerHTML = html;
                } else {
                    console.error("virtual-keyboard-container not found to append virtual keyboard html")
                }
            })
            .then(_ => {
                Array.from(document.getElementsByClassName('virtual-key'))
                    .forEach(element => longPressHandler<Start>(element, this, this.handleKeyPressViaVirtualKeyboard));

                this._currentWorldIdSubscriontion.set(
                    this._currentWorldId$.subscribe(id => {
                        for (let index = 0; index < 10; index++) {
                            const key = document.getElementById(`virtual-key-${index}`);
                            if (index == id) {
                                key?.classList.add('virtual-key--selected');
                            } else {
                                key?.classList.remove('virtual-key--selected');
                            }
                        }
                    })
                );
            });
    }

    private signalPhysicalEventToVirtualKeyboard(keyValue: string) {
        this._keyboardAnimationManager.triggerAnimation(keyValue);
    }

    private handleKeyPressViaVirtualKeyboard(self: Start, keyValue: string) {
        self.handleKeyPress(keyValue);
    }

    private handleKeyPress(keyValue: string) {
        if (!this._cameraControl.onNextEvent(keyValue)) {
            switch (keyValue) {
                case "": console.log(`invalid key`);
                case 'Escape': {
                    this._world?.resetConfig();
                    this._world?.mountCamera(this._camera);
                    break;
                }
                case "1": this.switchWorld(1); break;
                case "2": this.switchWorld(2); break;
                case "3": this.switchWorld(3); break;
                case "4": this.switchWorld(4); break;
                case "5": this.switchWorld(5); break;
                case "6": this.switchWorld(6); break;
                case "7": this.switchWorld(7); break;
                case "8": this.switchWorld(8); break;
                case "9": this.switchWorld(9); break;
                case "0": this.switchWorld(0); break;
                // default: console.log(`unhandled key ${keyValue}`); // maybe reactivate with 'debug build'?
            }
        }
    }

    private switchWorld(worldId: number) {
        console.log(`switching world to (${worldId})`);
        this._currentWorldId$.next(worldId);
        this._config.data.currentWorldId = worldId;
        this._abortWorldTick$.next();
        this._newWorldSubscription.set(
            timer(100).subscribe(() => { this.runWorld() })
        );
    }

    private runWorld() {
        this._world?.onDestroy();
        this._world = this.createWorldById(this._config.data.currentWorldId);
        console.log(`                       ${('_').repeat(this._world.name.length + 2)}`);
        console.log(`-> initializing world | ${this._world.name} |`);
        console.log(`                       ${('‾').repeat(this._world.name.length + 2)}`);
        this._world.mountCamera(this._camera);
        this.updateWorldTitle(this._world.name);
        const projector = new Projector(this._world, this._camera, stageModeWidth(this._stageMode), stageModeHeight(this._stageMode));
        this._stage.registerShapes(projector.shapes, this._world.backgroundColor);
        interval(this._config.data.worldTick)
            .pipe(takeUntil(this._abortWorldTick$))
            .subscribe({
                next: () => {
                    this._world?.tick();
                },
                complete: () => {
                    console.log('Old world completed - unregistering shapes');
                    this._stage.unregisterShapes(projector.shapes.id);
                }
            });
    }

    private createWorldById(worldId: number): World {
        switch (worldId) {
            case 1: return new Playground();
            case 2: return new RichtersRectangles();
            case 3: return new Grid();
            case 4: return new BellCurve();
            case 5: return new BouncingParticles();
            case 6: return new RandomPoints();
            case 7: return new HilbertCurve();
            case 8: return new SolarSystem();
            case 9: return new DoublePendulum2d();
            case 0: return new DoublePendulum3d();
            default: {
                console.error("Unnown world id", worldId);
                return new Playground();
            }
        }
    }

    private updateWorldTitle(name: string) {
        if (this._worldTitleArea != null) {
            this._worldTitleArea.textContent = `World: ${name} (${this._config.data.currentWorldId})`;
        }
    }

    private updateCameraInfo() {
        this._camera.state$.subscribe({
            next: (cameraPerspective) => {
                const displayableText = perspectiveToString(cameraPerspective)
                if (this._cameraInfoArea != null) {
                    this._cameraInfoArea.textContent = displayableText;
                }
            }
        });
    }
}