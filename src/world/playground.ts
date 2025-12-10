import { ModuleConfig } from '../config/module-config';
import { createDefaultPerspective } from '../types/perspective';
import { Circle3d, CircleStyle } from '../types/shape/circle';
import { Path3d, PathStyle } from '../types/shape/path';
import { Rectangle3d, RectangleStyle } from '../types/shape/rectangle';
import { createDefaultStyle, Text3d, TextStyle } from '../types/shape/text';
import { createOrigin } from '../types/vector-3';
import { World, WorldConfig } from './world';

export class Playground extends World {

    private _textStyle: TextStyle;

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

    private _darkRed = '#b00';
    private _darkGreen = '#0b0';
    private _darkBlue = '#00b';

    private _xCircles: Circle3d[] = [];
    private _yCircles: Circle3d[] = [];
    private _zCircles: Circle3d[] = [];

    public constructor() {
        super();
        this._textStyle = createDefaultStyle();
        this._textStyle.fontSize = 20;

        for (let i = 1.15; i <= 20; i += 0.15) {
            this._xCircles.push(new Circle3d({ x: i, y: 0, z: 0 }, 1, this.circleStyle(this._darkRed)));
            this._xCircles.push(new Circle3d({ x: -i, y: 0, z: 0 }, 1, this.circleStyle(this._darkRed)));
            this._yCircles.push(new Circle3d({ x: 0, y: i, z: 0 }, 1, this.circleStyle(this._darkGreen)));
            this._yCircles.push(new Circle3d({ x: 0, y: -i, z: 0 }, 1, this.circleStyle(this._darkGreen)));
            this._zCircles.push(new Circle3d({ x: 0, y: 0, z: i }, 1, this.circleStyle(this._darkBlue)));
            this._zCircles.push(new Circle3d({ x: 0, y: 0, z: -i }, 1, this.circleStyle(this._darkBlue)));
        }

        this.circles = [new Circle3d({ x: 0, y: 0, z: 0 }, 2.5, this._circleStyle)];
        this.circles = [...this.circles, ...this._xCircles, ...this._yCircles, ...this._zCircles];

        this.paths = [
            new Path3d([
                { x: -1, y: 0, z: 0 },
                { x: 1, y: 0, z: 0 },
            ], false, false, this.pathStyle('#f00')),
            new Path3d([
                { x: 0, y: -1, z: 0 },
                { x: 0, y: 1, z: 0 },
            ], false, false, this.pathStyle('#0f0')),
            new Path3d([
                { x: 0, y: 0, z: -1 },
                { x: 0, y: 0, z: 1 },
            ], false, false, this.pathStyle('#00f')),
        ];

        this.rectangles = [new Rectangle3d(createOrigin(), 3, 3, { rotateX: 90, rotateY: 0, rotateZ: 0 }, this._rectangleStyle)];

        this.texts = [new Text3d({ x: 1, y: 0, z: 0 }, 'Hello', false, this._textStyle)];

        this.init();
    }

    override config = new ModuleConfig<WorldConfig>(
        { cameraPerspective: createDefaultPerspective() },
        "playgroundConfig",
    );

    public name: string = "Playground";

    override transitionToStateAt(t: number): void {
        const textToggle = t % 150 < 75;
        this.texts[0].text = textToggle ? 'Hello' : 'World';

        const colorConfig = Math.floor(t / 50) % 3;
        let color1 = this._darkRed;
        let color2 = this._darkGreen;
        let color3 = this._darkBlue
        switch (colorConfig) {
            case 1: {
                color1 = this._darkGreen;
                color2 = this._darkBlue;
                color3 = this._darkRed;
            }
                break;
            case 2: {
                color1 = this._darkBlue;
                color2 = this._darkRed;
                color3 = this._darkGreen;
            }
                break;
        }
        this._xCircles.forEach(circle => circle.style = this.circleStyle(color1));
        this._yCircles.forEach(circle => circle.style = this.circleStyle(color2));
        this._zCircles.forEach(circle => circle.style = this.circleStyle(color3));
    }

    private pathStyle(color: string): PathStyle {
        return {
            strokeWidth: 2,
            stroke: color,
            strokeOpacity: .5,
        };
    }

    private circleStyle(color: string): CircleStyle {
        return {
            strokeWidth: 0,
            stroke: '#000',
            strokeOpacity: 0,
            fill: color,
            fillOpacity: .5,
        }
    }
}
