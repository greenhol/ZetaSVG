import { ONE_DEGREE } from '../types/constants';
import { Camera } from './camera';

enum ValidKeys {
    W = 'w',
    A = 'a',
    S = 's',
    D = 'd',
    R = 'r',
    F = 'f',
    O = 'o',
    P = 'p',
    Up = 'ArrowUp',
    Left = 'ArrowLeft',
    Down = 'ArrowDown',
    Right = 'ArrowRight',
    Comma = ',',
    Dot = '.',
    Plus = '+',
    Minus = '-',
};

export class CameraKeyboardConnector {

    private _camera: Camera;

    constructor(camera: Camera) {
        this._camera = camera;
    }

    public onNextEvent(event: string): boolean {
        switch (event) {
            case ValidKeys.W: { this._camera.moveDepth(0.1); } return true;
            case ValidKeys.A: { this._camera.moveHorizontal(-0.1); } return true;
            case ValidKeys.S: { this._camera.moveDepth(-0.1); } return true;
            case ValidKeys.D: { this._camera.moveHorizontal(0.1); } return true;
            case ValidKeys.R: { this._camera.moveVertical(0.1); } return true;
            case ValidKeys.F: { this._camera.moveVertical(-0.1); } return true;
            case ValidKeys.Up: { this._camera.pitch(ONE_DEGREE); } return true;
            case ValidKeys.Left: { this._camera.yaw(ONE_DEGREE); } return true;
            case ValidKeys.Down: { this._camera.pitch(-ONE_DEGREE); } return true;
            case ValidKeys.Right: { this._camera.yaw(-ONE_DEGREE); } return true;
            case ValidKeys.Comma: { this._camera.roll(-ONE_DEGREE); } return true;
            case ValidKeys.Dot: { this._camera.roll(ONE_DEGREE); } return true;
            case ValidKeys.P: { this._camera.togglePerspective(); } return true;
            case ValidKeys.Plus: { this._camera.increaseFov(); } return true;
            case ValidKeys.Minus: { this._camera.decreaseFov(); } return true;
            default: return false;
        }
    }
};

export class KeyboardAnimationManager {
    private _listeners: Map<HTMLElement, () => void> = new Map();
    private _animationClassName = 'physical-key-pressed-detected';
    private _animationEndEvent = 'animationend';

    public triggerAnimation(keyValue: string): void {
        const element = this.getElementFromKeyValue(keyValue);
        if (element != null) {
            const onAnimationEnd = () => {
                element.classList.remove(this._animationClassName);
                this._listeners.delete(element);
            };

            this.cleanupListener(element);

            element.classList.remove(this._animationClassName);
            void element.offsetWidth;
            element.classList.add(this._animationClassName);

            element.addEventListener(this._animationEndEvent, onAnimationEnd, { once: true });
            this._listeners.set(element, onAnimationEnd);
        }
    }

    public cleanupAll(): void {
        this._listeners.forEach((listener, element) => {
            element.removeEventListener(this._animationEndEvent, listener);
        });
        this._listeners.clear();
    }

    private cleanupListener(element: HTMLElement): void {
        const existingListener = this._listeners.get(element);
        if (existingListener) {
            element.removeEventListener(this._animationEndEvent, existingListener);
            this._listeners.delete(element);
        }
    }

    private getElementFromKeyValue(keyValue: string): HTMLElement | null {
        switch (keyValue) {
            case ValidKeys.W:
            case ValidKeys.A:
            case ValidKeys.S:
            case ValidKeys.D:
            case ValidKeys.R:
            case ValidKeys.F:
            case ValidKeys.O:
            case ValidKeys.P:
            case ValidKeys.Up:
            case ValidKeys.Left:
            case ValidKeys.Down:
            case ValidKeys.Right: return document.getElementById(`virtual-key-${keyValue}`);
            case ValidKeys.Comma: return document.getElementById(`virtual-key-Comma`);
            case ValidKeys.Dot: return document.getElementById(`virtual-key-Period`);
            case ValidKeys.Plus: return document.getElementById(`virtual-key-Plus`);
            case ValidKeys.Minus: return document.getElementById(`virtual-key-Minus`);
            case 'Escape': return document.getElementById(`virtual-key-Escape`);
            default: return null;
        }
    }
}