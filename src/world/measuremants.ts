import { InitializeAfterConstruct } from '../../shared';
import { ModuleConfig } from '../../shared/config';
import { ONE_DEGREE } from '../types/constants';
import { createDefaultPerspective } from '../types/perspective';
import { Circle3d, circleStyle } from '../types/shape/circle';
import { Path3d, pathStyle, PathStyle } from '../types/shape/path';
import { Text3d, textStyle } from '../types/shape/text';
import { World, WorldConfig } from './world';

interface MeasurementsConfig extends WorldConfig { }

@InitializeAfterConstruct()
export class Measurements extends World {

    private _textStyle = textStyle()
        .fontSize(6)
        .fontFamily('Calibri, sans-serif, Times New Roman')
        .get();

    private _circleStyle = circleStyle()
        .strokeWidth(0)
        .stroke('#fff')
        .fill('#aaf')
        .fillOpacity(0.2)
        .get();

    public constructor() {
        super();

        this.circles = [
            new Circle3d({ x: 0, y: 0, z: 0 }, 10, this._circleStyle),
            new Circle3d({ x: 0, y: 0, z: 0 }, 20, this._circleStyle),
            new Circle3d({ x: 0, y: 0, z: 0 }, 40, this._circleStyle),
        ];

        this.paths = [
            // X
            new Path3d([
                { x: -2, y: 0, z: 0 },
                { x: -1, y: 0, z: 0 },
            ], false, false, this.pathStyle('#00f')),
            new Path3d([
                { x: -1, y: 0, z: 0 },
                { x: 1, y: 0, z: 0 },
            ], false, false, this.pathStyle('#f00')),
            new Path3d([
                { x: 1, y: 0, z: 0 },
                { x: 2, y: 0, z: 0 },
            ], false, false, this.pathStyle('#0f0')),
            // Y
            new Path3d([
                { x: 0, y: -2, z: 0 },
                { x: 0, y: -1, z: 0 },
            ], false, false, this.pathStyle('#f00')),
            new Path3d([
                { x: 0, y: -1, z: 0 },
                { x: 0, y: 1, z: 0 },
            ], false, false, this.pathStyle('#0f0')),
            new Path3d([
                { x: 0, y: 1, z: 0 },
                { x: 0, y: 2, z: 0 },
            ], false, false, this.pathStyle('#00f')),
            // Z
            new Path3d([
                { x: 0, y: 0, z: -2 },
                { x: 0, y: 0, z: -1 },
            ], false, false, this.pathStyle('#0f0')),
            new Path3d([
                { x: 0, y: 0, z: -1 },
                { x: 0, y: 0, z: 1 },
            ], false, false, this.pathStyle('#00f')),
            new Path3d([
                { x: 0, y: 0, z: 1 },
                { x: 0, y: 0, z: 2 },
            ], false, false, this.pathStyle('#f00')),
        ];

        // this.texts = [
        //     new Text3d({ x: 0, y: 0, z: 0 }, 'O', false, this._textStyle),
        //     new Text3d({ x: 1, y: 0, z: 0 }, 'X', false, this._textStyle),
        //     new Text3d({ x: 0, y: 1, z: 0 }, 'Y', false, this._textStyle),
        //     new Text3d({ x: 0, y: 0, z: 1 }, 'Z', false, this._textStyle),
        // ];
    }

    override config = new ModuleConfig<MeasurementsConfig>(
        {
            cameraPerspective: {
                position: { x: 0, y: 0, z: -1 },
                angleX: 0 * ONE_DEGREE,
                angleY: 0 * ONE_DEGREE,
                angleZ: 0 * ONE_DEGREE,
            }
        },
        'measurementsConfig',
        [],
    );

    public name: string = 'Measurements';

    override transitionToStateAt(t: number): void {
        // Do nothing
    }

    private pathStyle(color: string): PathStyle {
        return pathStyle()
            .strokeWidth(1)
            .stroke(color)
            .strokeOpacity(.5)
            .strokeLinecap('round')
            .get();
    }
}
