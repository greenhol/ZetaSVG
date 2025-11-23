import { ModuleConfig } from '../config/module-config';
import { createDefaultPerspective } from '../types/perspective';
import { Circle3d, CircleStyle } from '../types/shape/circle';
import { Path3d, PathStyle } from '../types/shape/path';
import { Rectangle3d, RectangleStyle } from '../types/shape/rectangle';
import { Text3d } from '../types/shape/text';
import { createOrigin } from '../types/space-coord';
import { World, WorldConfig } from './world';

export class Playground extends World {

    private _circleStyle: CircleStyle = {
        strokeWidth: 0.5,
        stroke: '#fff',
        strokeOpacity: 1,
        fill: '#f80',
        fillOpacity: 1
    }

    private _rectangleStyle: RectangleStyle = {
        strokeWidth: 1,
        stroke: '#00f',
        strokeOpacity: 1,
        fill: '#4af',
        fillOpacity: .2,
    };

    public constructor() {
        super();

        this.circles = [new Circle3d({ x: 0, y: 0, z: 0 }, 2.5, this._circleStyle)];

        this.paths = [
            new Path3d([
                { x: -1, y: 0, z: 0 },
                { x: 1, y: 0, z: 0 },
            ], false, this.pathStyle('#f00')),
            new Path3d([
                { x: 0, y: -1, z: 0 },
                { x: 0, y: 1, z: 0 },
            ], false, this.pathStyle('#0f0')),
            new Path3d([
                { x: 0, y: 0, z: -1 },
                { x: 0, y: 0, z: 1 },
            ], false, this.pathStyle('#00f')),
        ];

        this.rectangles = [new Rectangle3d(createOrigin(), 3, 3, 90, 0, 0, this._rectangleStyle)];

        this.texts = [new Text3d({ x: 1, y: 0, z: 0 }, 'Hello')];

        this.init();
    }

    override config = new ModuleConfig<WorldConfig>(
        { cameraPerspective: createDefaultPerspective() },
        "playgroundConfig",
    );

    public name: string = "Playground";

    override transitionToStateAt(t: number): void {
        let toggle = t % 100 < 50;
        if (toggle) {
            this.texts[0].text = 'Hello';
        } else {
            this.texts[0].text = 'World';
        }
    }

    private pathStyle(color: string): PathStyle {
        return {
            strokeWidth: 3,
            stroke: color,
            strokeOpacity: .5,
        };
    }
}
