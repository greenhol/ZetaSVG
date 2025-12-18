import { ModuleConfig } from '../config/module-config';
import { ONE_DEGREE } from '../types/constants';
import { Rectangle3d, rectangleStyle } from '../types/shape/rectangle';
import { createOrigin } from '../types/vector-3';
import { colors } from './richters-rectangles.colors';
import { World, WorldConfig } from './world';

export class RichtersRectangles extends World {
    private _rows = 8;
    private _columns = 8;
    private _layers = 8;

    private _speedX: number[];
    private _speedY: number[];
    private _speedZ: number[];

    constructor() {
        super();

        const rectanglesCount = this._rows * this._columns * this._layers;
        this.rectangles = colors.map(color => this.createRectangle(color));
        while (this.rectangles.length < rectanglesCount) {
            const color = colors[Math.floor(Math.random() * colors.length)];
            this.rectangles.push(this.createRectangle(color));
        }
        this.rectangles.sort(() => Math.random() - 0.5);

        for (let layer = 0; layer < this._layers; layer++) {
            for (let row = 0; row < this._rows; row++) {
                for (let column = 0; column < this._columns; column++) {
                    this.rectangles[layer * this._rows * this._columns + row * this._columns + column].position = {
                        x: -column + this._columns / 2 - 0.5,
                        y: -row + this._rows / 2 - 0.5,
                        z: layer - this._layers / 2 + 0.5,
                    };
                }
            }
        }

        this._speedX = Array.from({ length: rectanglesCount }, () => Math.random() * 5);
        this._speedY = Array.from({ length: rectanglesCount }, () => Math.random() * 5);
        this._speedZ = Array.from({ length: rectanglesCount }, () => Math.random() * 5);

        this.init();
    }

    override config = new ModuleConfig<WorldConfig>(
        {
            cameraPerspective: {
                position: { x: -0, y: 0, z: -8 },
                angleX: 0 * ONE_DEGREE,
                angleY: 90 * ONE_DEGREE,
                angleZ: 0 * ONE_DEGREE,
            },
        },
        "richtersRectanglesConfig",
    );

    public name: string = "Richters Rectangles";

    override backgroundColor: string = '#ccc'

    public transitionToStateAt(t: number): void {
        const delayPerLayer: number[] = [30, 46, 60, 72, 82, 90, 96, 100];
        const time: number[] = delayPerLayer.map(delay => Math.max(t - delay, 0));

        this.rectangles.forEach((rectangle, index) => {
            const layerIndex = Math.floor(index / (this._rows * this._columns));
            rectangle.orientation = {
                rotateX: this._speedX[index] * time[layerIndex],
                rotateY: this._speedY[index] * time[layerIndex],
                rotateZ: this._speedZ[index] * time[layerIndex],
            }
        });
    }

    private createRectangle(color: string): Rectangle3d {
        const style = rectangleStyle()
            .strokeWidth(0)
            .stroke('none')
            .fill(color)
            .fillOpacity(.6)
            .get();

        return new Rectangle3d(createOrigin(), 1, 1, undefined, style);
    }
}
