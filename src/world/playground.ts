import { ModuleConfig } from '../config/module-config';
import { createDefaultPerspective } from '../types/perspective';
import { Circle3d, CircleStyle, circleStyle } from '../types/shape/circle';
import { Group3d, SortBy } from '../types/shape/group';
import { Path3d, pathStyle, PathStyle } from '../types/shape/path';
import { Rectangle3d, rectangleStyle } from '../types/shape/rectangle';
import { Text3d, textStyle } from '../types/shape/text';
import { createOrigin } from '../types/vector-3';
import { World, WorldConfig } from './world';

export class Playground extends World {

    private _textStyle = textStyle()
        .fontSize(20)
        .fontFamily('Calibri, sans-serif, Times New Roman')
        .get();

    private _circleStyle = circleStyle()
        .strokeWidth(0.5)
        .stroke('#fff')
        .fill('#f80')
        .get();

    private _bigCircleStyle = circleStyle()
        .strokeWidth(3)
        .stroke('#000')
        .fill('#00f')
        .fillOpacity(.5)
        .get();

    private _groupCircleStyle = circleStyle()
        .strokeWidth(2)
        .stroke('#000')
        .fill('#fff')
        .get();

    private _rectangleStyle = rectangleStyle()
        .strokeWidth(1)
        .stroke('#00f')
        .strokeLinejoin('round')
        .fill('#4af')
        .fillOpacity(.2)
        .get();

    private _darkRed = '#b00';
    private _darkGreen = '#0b0';
    private _darkBlue = '#00b';

    private _xCircles: Circle3d[] = [];
    private _yCircles: Circle3d[] = [];
    private _zCircles: Circle3d[] = [];

    public constructor() {
        super();

        for (let i = 1.15; i <= 20; i += 0.45) {
            this._xCircles.push(new Circle3d({ x: i, y: 0, z: 0 }, 1, this.circleStyle(this._darkRed)));
            this._xCircles.push(new Circle3d({ x: -i, y: 0, z: 0 }, 1, this.circleStyle(this._darkRed)));
            this._yCircles.push(new Circle3d({ x: 0, y: i, z: 0 }, 1, this.circleStyle(this._darkGreen)));
            this._yCircles.push(new Circle3d({ x: 0, y: -i, z: 0 }, 1, this.circleStyle(this._darkGreen)));
            this._zCircles.push(new Circle3d({ x: 0, y: 0, z: i }, 1, this.circleStyle(this._darkBlue)));
            this._zCircles.push(new Circle3d({ x: 0, y: 0, z: -i }, 1, this.circleStyle(this._darkBlue)));
        }

        this.circles = [
            new Circle3d({ x: 0, y: 0, z: 0 }, 3, this._circleStyle),
            new Circle3d({ x: 0, y: 0, z: 5 }, 20, this._bigCircleStyle),
        ];
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

        this.groups = [
            new Group3d(
                { x: -3, y: 0, z: 0 },
                [
                    new Path3d([{ x: 0, y: 2, z: 0 }, createOrigin()], false, false, this.pathStyle('#f80')),
                    new Circle3d({ x: 0, y: 2, z: 0 }, 5, this._groupCircleStyle),
                    new Circle3d(createOrigin(), 5, this._groupCircleStyle),
                ],
                SortBy.INDEX,
            ),
            new Group3d(
                { x: 3, y: 0, z: 0 },
                [
                    new Circle3d({ x: 0, y: 2, z: 0 }, 5, this._groupCircleStyle),
                    new Path3d([{ x: 0, y: 2, z: 0 }, createOrigin()], false, false, this.pathStyle('#f80')),
                    new Circle3d(createOrigin(), 5, this._groupCircleStyle),
                ],
            ),
        ];

        this.init();
    }

    override config = new ModuleConfig<WorldConfig>(
        { cameraPerspective: createDefaultPerspective() },
        "playgroundConfig",
    );

    override backgroundColor: string = '#d0e4ff';

    public name: string = "Playground";

    override transitionToStateAt(t: number): void {
        const toggle = t % 150 < 75;
        this.texts[0].text = toggle ? 'Hello' : 'World';
        this.circles[1].visible = toggle;

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
        return pathStyle()
            .strokeWidth(2)
            .stroke(color)
            .strokeOpacity(.5)
            .strokeLinecap('round')
            .get()
    }

    private circleStyle(color: string): CircleStyle {
        return circleStyle()
            .strokeWidth(0)
            .stroke('#000')
            .strokeOpacity(0)
            .fill(color)
            .fillOpacity(.5)
            .get();
    }
}
