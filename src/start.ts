import { BehaviorSubject, interval, Subject, takeUntil, timer } from 'rxjs';
import { ConfigOverlay, configVersionCheck, ModuleConfig } from '../shared/config';
import { DragDelta, InteractionOverlay } from './input/interaction-overlay';
import { KeyboardInput, MoveDelta, RotationDelta } from './input/keyboard-input';
import { VirtualKeyboardAnimations } from './input/virtual-keyboard-animations';
import { Camera } from './stage/camera';
import { Projector } from './stage/projector';
import { Stage } from './stage/stage';
import { StageMode } from './stage/stage-mode';
import { Perspective } from './types/perspective';
import { SerialSubscription } from './utils/serial-subscription';
import { UrlHandler } from './utils/url-handler';
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

declare const APP_NAME: string;
declare const APP_VERSION: string;

interface MainConfig {
    currentWorldId: number,
    lookSensitivity: number,
    movementSensitivity: number,
}

export class Start {

    private _config: ModuleConfig<MainConfig>;
    private _urlHandler: UrlHandler = new UrlHandler();
    private _configOverlay: ConfigOverlay;

    private _stage: Stage;
    private _interactionOverlay: InteractionOverlay;
    private _stageMode: StageMode;
    private _camera: Camera;
    private _world: World | null;

    private _keyboardAnimationManager = new VirtualKeyboardAnimations();
    private _keyboardInput = new KeyboardInput();

    private _currentWorldId$: BehaviorSubject<number>;
    private _abortWorldTick$ = new Subject<void>();
    private _newWorldSubscription = new SerialSubscription();
    private _currentWorldIdSubscriontion = new SerialSubscription();

    private _worldTitleArea = document.getElementById('worldTitle');
    private _cameraInfoArea = document.getElementById('cameraInfo');

    constructor() {
        console.log(`#constructor(Start) - ${APP_NAME} - Version: ${APP_VERSION}`);
        configVersionCheck();
        this._stageMode = StageMode.evaluate();

        const mainDiv = document.getElementById('main');
        if (mainDiv == null) {
            console.error('Critical: Main div element not found');
            return;
        }
        this.setupStage(mainDiv);

        this._stage = new Stage('main');
        this._interactionOverlay = new InteractionOverlay('main');
        this._camera = new Camera();
        this._world = null;

        this._config = new ModuleConfig<MainConfig>({ currentWorldId: 1, lookSensitivity: 1.5, movementSensitivity: 1.5 }, 'mainConfig' + APP_NAME);
        const initialWorldId = this._urlHandler.getWorldId() ?? this._config.data.currentWorldId;
        this._config.data.currentWorldId = initialWorldId;
        this._currentWorldId$ = new BehaviorSubject<number>(this._config.data.currentWorldId);

        const isImmersive = this._stageMode == StageMode.IMMERSIVE;
        this.handlePhysicalKeyboardEvents(!isImmersive);
        this.subscribeToInteractions();
        this.subscribeToKeyboardInput();
        if (!isImmersive) {
            this.appendVirtualKeyboard();
            this.updateCameraInfo();
        }
        this.addConfigurationOverlay();
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
                console.log('Fullscreen detected - going immersive!');
                mainDiv.classList.add('main--immersive');
                infoDiv?.classList.add('element--gone');
                keyboardDiv?.classList.add('element--gone');
                break;
            }
        }

        window.addEventListener('resize', () => {
            const newStageMode = StageMode.evaluate();
            if (newStageMode !== this._stageMode) {
                window.location.reload();
            }
        });
    }

    private subscribeToInteractions() {
        this._interactionOverlay.drag$.subscribe((delta: DragDelta) => {
            if (delta.dx !== 0) this._camera.yaw(delta.dx * this._config.data.lookSensitivity * Math.pow(this._camera.fovRadians, 0.5) / this._interactionOverlay.height);
            if (delta.dy !== 0) this._camera.pitch(delta.dy * this._config.data.lookSensitivity * Math.pow(this._camera.fovRadians, 0.5) / this._interactionOverlay.height);
        });
        this._interactionOverlay.pan$.subscribe((delta: DragDelta) => {
            if (delta.dx !== 0) this._camera.moveHorizontal(-delta.dx * 2 * this._config.data.movementSensitivity * this._camera.distance * Math.tan(this._camera.fovRadians / 2) / this._interactionOverlay.height);
            if (delta.dy !== 0) this._camera.moveVertical(delta.dy * 2 * this._config.data.movementSensitivity * this._camera.distance * Math.tan(this._camera.fovRadians / 2) / this._interactionOverlay.height);
        });
        this._interactionOverlay.pinch$.subscribe((delta: number) => {
            if (delta !== 0) this._camera.moveDepth(delta * this._config.data.movementSensitivity * this._camera.distance * Math.tan(this._camera.fovRadians / 2) / this._interactionOverlay.height);
        });
    }

    private subscribeToKeyboardInput() {
        this._keyboardInput.move$.subscribe((delta: MoveDelta) => {
            if (delta.dx !== 0) this._camera.moveHorizontal(delta.dx);
            if (delta.dy !== 0) this._camera.moveVertical(delta.dy);
            if (delta.dz !== 0) this._camera.moveDepth(-delta.dz);
        });
        this._keyboardInput.rotation$.subscribe((delta: RotationDelta) => {
            if (delta.dPitch !== 0) this._camera.pitch(delta.dPitch / 8);
            if (delta.dYaw !== 0) this._camera.yaw(delta.dYaw / 8);
            if (delta.dRoll !== 0) this._camera.roll(delta.dRoll / 8);
        });
        this._keyboardInput.fov$.subscribe((delta: number) => {
            (delta > 0) ? this._camera.increaseFov() : this._camera.decreaseFov();
        });
        this._keyboardInput.action$.subscribe((key: string) => {
            switch (key) {
                case 'Escape': {
                    this._world?.resetCamera();
                    this._world?.mountCamera(this._camera);
                    break;
                }
                case '1': this.switchWorld(1); break;
                case '2': this.switchWorld(2); break;
                case '3': this.switchWorld(3); break;
                case '4': this.switchWorld(4); break;
                case '5': this.switchWorld(5); break;
                case '6': this.switchWorld(6); break;
                case '7': this.switchWorld(7); break;
                case '8': this.switchWorld(8); break;
                case '9': this.switchWorld(9); break;
                case '0': this.switchWorld(0); break;
                case 'o': this.openConfigOverlay(); break;
                case 'v': this._camera.togglePerspective(); break;
            }
        });
    }

    private handlePhysicalKeyboardEvents(signalToVirtualKeyboard: Boolean) {
        document.addEventListener('keydown', (event) => {
            if (this._configOverlay.isOpen) return;
            if (signalToVirtualKeyboard) this._keyboardAnimationManager.triggerAnimation(event.key);
            this._keyboardInput.onKeyDown(event.key);
        });
        document.addEventListener('keyup', (event) => {
            if (this._configOverlay.isOpen) return;
            this._keyboardInput.onKeyUp(event.key);
        });
    }

    private handleVirtualKeyboardEvents(element: HTMLElement) {
        const keyValue = element.dataset.key || '';
        element.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
        element.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            this._keyboardInput.onKeyDown(keyValue);
        });
        element.addEventListener('pointerup', (e) => {
            e.preventDefault();
            this._keyboardInput.onKeyUp(keyValue);
        });
        element.addEventListener('pointercancel', (e) => {
            e.preventDefault();
            this._keyboardInput.onKeyUp(keyValue);
        });
    }

    private appendVirtualKeyboard() {
        fetch('virtual-keyboard.html')
            .then(response => response.text())
            .then(html => {
                const virtualKeyboardContainer = document.getElementById('virtual-keyboard-container');
                if (virtualKeyboardContainer != null) {
                    virtualKeyboardContainer.innerHTML = html;
                } else {
                    console.error('virtual-keyboard-container not found to append virtual keyboard html');
                }
            })
            .then(_ => {
                Array.from(document.getElementsByClassName('virtual-key'))
                    .forEach((element: Element) => this.handleVirtualKeyboardEvents(element as HTMLElement));

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

    private addConfigurationOverlay() {
        this._configOverlay = new ConfigOverlay('overlay-container', ['Escape', 'o']);
    }

    private openConfigOverlay() {
        this._configOverlay.openOverlay();
    }

    private switchWorld(worldId: number) {
        console.log(`switching world to (${worldId})`);
        this._currentWorldId$.next(worldId);
        this._config.data.currentWorldId = worldId;
        this._abortWorldTick$.next();
        this._newWorldSubscription.set(
            timer(100).subscribe(() => { this.runWorld(); })
        );
    }

    private runWorld() {
        this._world?.onDestroy();
        this._world = this.createWorldById(this._config.data.currentWorldId);
        this._world.mountCamera(this._camera);
        this.updateWorldTitle(this._world.name);
        this._configOverlay.setConfig(this._world.config);

        this._urlHandler.updateWorldId(this._config.data.currentWorldId);
        console.log(`                       ${('_').repeat(this._world.name.length + 2)}`);
        console.log(`-> initializing world | ${this._world.name} |`);
        console.log(`                       ${('‾').repeat(this._world.name.length + 2)}`);

        const projector = new Projector(
            this._world,
            this._camera,
            StageMode.getWidth(this._stageMode),
            StageMode.getHeight(this._stageMode),
            40,
        );

        this._stage.registerShapes(projector.shapes, this._world.backgroundColor);
        interval(40)
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
                console.error('Unnown world id', worldId);
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
                const displayableText = Perspective.toString(cameraPerspective);
                if (this._cameraInfoArea != null) {
                    this._cameraInfoArea.textContent = displayableText;
                }
            }
        });
    }
}