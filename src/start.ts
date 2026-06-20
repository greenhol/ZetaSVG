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
import { ColorSpaces } from './world/color-spaces';
import { ColorSpaces3D } from './world/color-spaces-3d';
import { DotCube } from './world/dot-cube';
import { DoublePendulum2d } from './world/double-pendulum-2d';
import { DoublePendulum3d } from './world/double-pendulum-3d';
import { HilbertCurve } from './world/hilbert-curve';
import { Measurements } from './world/measuremants';
import { Playground } from './world/playground';
import { RandomPoints } from './world/random-points';
import { RichtersRectangles } from './world/richters-rectangles';
import { SolarSystem } from './world/solar-system';
import { World } from './world/world';
import { Realm, RealmId, REALMS, WorldId, WorldType } from './world/world-type';

declare const APP_NAME: string;
declare const APP_VERSION: string;

interface MainConfig {
    currentWorldId: WorldId,
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

    private _realmSelect = document.getElementById('realmSelect') as HTMLSelectElement;
    private _realm: Realm;
    private _world: World | null;

    private _keyboardAnimationManager = new VirtualKeyboardAnimations();
    private _keyboardInput = new KeyboardInput();

    private _currentWorldId$: BehaviorSubject<WorldId>;
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

        this._config = new ModuleConfig<MainConfig>({ currentWorldId: 'PLAYGROUND', lookSensitivity: 1.5, movementSensitivity: 1.5 }, 'mainConfig' + APP_NAME);
        const initialWorldId = this._urlHandler.getWorldId() ?? this._config.data.currentWorldId;
        this._config.data.currentWorldId = initialWorldId;
        this._currentWorldId$ = new BehaviorSubject<WorldId>(this._config.data.currentWorldId);
        const realm = WorldType.getRealm(this._config.data.currentWorldId) ?? REALMS[0];
        this.setRealm(realm.id);

        const isImmersive = this._stageMode == StageMode.IMMERSIVE;
        this.handlePhysicalKeyboardEvents(!isImmersive);
        this.subscribeToInteractions();
        this.subscribeToKeyboardInput();
        if (!isImmersive) {
            this.initializeRealmSelect();
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
                this._realmSelect?.classList.add('element--gone');
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
            if (delta.dx !== 0) this._camera.moveHorizontal(delta.dx * 2 * this._config.data.movementSensitivity * this._camera.distance * Math.tan(this._camera.fovRadians / 2) / this._interactionOverlay.height);
            if (delta.dy !== 0) this._camera.moveVertical(-delta.dy * 2 * this._config.data.movementSensitivity * this._camera.distance * Math.tan(this._camera.fovRadians / 2) / this._interactionOverlay.height);
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
                case '0': this.switchWorld(10); break;
                case 'o': this.openConfigOverlay(); break;
                case 'v': this._camera.togglePerspective(); break;
                case 'Backspace': this.openRealmSelect(); break;
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
                        const worldNumber = WorldType.getWorldNumber(id);
                        for (let index = 1; index < 11; index++) {
                            const key = document.getElementById(`virtual-key-${index}`);
                            if (index == worldNumber) {
                                key?.classList.add('virtual-key--selected');
                            } else {
                                key?.classList.remove('virtual-key--selected');
                            }
                        }
                    })
                );

                this.setWorldSelectKeyVisibility(this._realm.worlds.length + 1);
            });
    }

    private setWorldSelectKeyVisibility(cnt: number) {
        for (let index = 1; index < 11; index++) {
            const key = document.getElementById(`virtual-key-${index}`);
            if (index >= cnt) {
                key?.classList.add('virtual-key--hidden');
            } else {
                key?.classList.remove('virtual-key--hidden');
            }
        }
    }

    private initializeRealmSelect() {
        this._realmSelect.innerHTML = '';
        let selectedWorldId = this._config.data.currentWorldId;
        for (const realm of REALMS) {
            const option = document.createElement('option');
            option.label = realm.name;
            option.value = realm.id;
            option.selected = realm.worlds.find(w => w.id === selectedWorldId) !== undefined;
            this._realmSelect.appendChild(option);
        }
        this._realmSelect?.addEventListener('change', (event) => {
            const selectedValue = (event.target as HTMLSelectElement).value;
            console.log(`#initializeRealmSelect - Selected realm: ${selectedValue}`);
            this.setRealm(selectedValue as RealmId);
            this.switchWorld(1);
        });
        this._realmSelect.addEventListener('keydown', (event) => {
            event.preventDefault();
        });
    }

    private openRealmSelect() {
        console.log('openRealmSelect');
        this._realmSelect.showPicker();
    }

    private setRealm(realmId: RealmId) {
        this._realm = WorldType.getRealmById(realmId) ?? REALMS[0];
        this.setWorldSelectKeyVisibility(this._realm.worlds.length + 1);
    }

    private addConfigurationOverlay() {
        this._configOverlay = new ConfigOverlay('overlay-container', ['Escape', 'o']);
    }

    private openConfigOverlay() {
        this._configOverlay.openOverlay();
    }

    private switchWorld(worldNumber: number) {
        if (worldNumber > this._realm.worlds.length) return;
        const worldId = this._realm.worlds[worldNumber - 1].id;
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
        const name = this.updateWorldTitle();
        this._configOverlay.setConfig(this._world.config);

        this._urlHandler.setWorld(this._config.data.currentWorldId);
        console.log(`                       ${('_').repeat(name.length + 2)}`);
        console.log(`-> initializing world | ${name} |`);
        console.log(`                       ${('‾').repeat(name.length + 2)}`);

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

    private createWorldById(worldId: WorldId): World {
        switch (worldId) {
            case 'PLAYGROUND': return new Playground();
            case 'MEASUREMENTS': return new Measurements();
            case 'COLOR_SPACES': return new ColorSpaces();
            case 'COLOR_SPACES_3D': return new ColorSpaces3D();
            case 'RICHTERS_RECTANGLES': return new RichtersRectangles();
            case 'DOT_CUBE': return new DotCube();
            case 'BELL_CURVE': return new BellCurve();
            case 'BOUNCING_PARTICLES': return new BouncingParticles();
            case 'RANDOM_POINTS': return new RandomPoints();
            case 'HILBERT_CURVE': return new HilbertCurve();
            case 'SOLAR_SYSTEM': return new SolarSystem();
            case 'DOUBLE_PENDULUM_2D': return new DoublePendulum2d();
            case 'DOUBLE_PENDULUM_3D': return new DoublePendulum3d();
            default: {
                console.error('Unnown world id', worldId);
                return new Playground();
            }
        }
    }

    private updateWorldTitle(): string {
        const worldType = WorldType.getWorldById(this._config.data.currentWorldId);
        if (this._worldTitleArea != null && worldType != null) {
            this._worldTitleArea.textContent = `World: ${worldType.name}`;
            return worldType.name;
        }
        return '';
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