import { InitializeAfterConstruct } from '../../shared';
import { ModuleConfig } from '../../shared/config';
import { Circle3d, circleStyle } from '../types/shape/circle';
import { Path3d, pathStyle } from '../types/shape/path';
import { Text3d, textStyle } from '../types/shape/text';
import { Vector3 } from '../types/vector-3';
import { ColorSpaces2dData } from './color-spaces-2d.data';
import { MainColorProperties } from './color-spaces.data';
import { CREATE } from './ui/world-config-field-creator';
import { World, WorldConfig } from './world';

interface ColorSpaces2DConfig extends WorldConfig {
    radius: number;
    density: number;
    showInfo: boolean;
    showSRGB: boolean;
    showAdobeRGB: boolean;
    showP3: boolean;
    showRec2020: boolean;
}

@InitializeAfterConstruct()
export class ColorSpaces2D extends World {

    private d65CircleStyle = circleStyle()
        .fill('#fff')
        .strokeWidth(0.2)
        .stroke('#99f')
        .get();

    private spectralLocusPathStyle = pathStyle()
        .stroke('#99f')
        .get();

    private rectanglePathStyle = pathStyle()
        .stroke('#bbb')
        .strokeWidth(3)
        .strokeOpacity(0.33)
        .strokeLinejoin('round')
        .get();

    private infoPathStyle = pathStyle()
        .stroke('#aaf')
        .strokeWidth(1)
        .get();

    private infoTextStyle = textStyle()
        .alignmentBaseline('middle')
        .fontSize(6)
        .get();

    constructor() {
        super();
        const data = new ColorSpaces2dData();

        this.texts = [];
        this.paths = [new Path3d(data.spectralLocus.map((pos) => { return Vector3.add(pos, data.d65offset); }), true, true, this.spectralLocusPathStyle)];
        this.circles = [new Circle3d(Vector3.origin(), 4, this.d65CircleStyle)];

        if (this.config.data.showSRGB) {
            const prop = data.dotProp.sRGB;
            if (this.config.data.showInfo) {
                const anchorStart = prop.green.position;
                const anchorEnd: Vector3 = { x: 6, y: anchorStart.y, z: 0 };
                this.paths.push(
                    new Path3d(this.translatePathByOffset([prop.red.position, prop.green.position, prop.blue.position], data.d65offset), true, true, this.rectanglePathStyle),
                    new Path3d(this.translatePathByOffset([anchorStart, anchorEnd], data.d65offset), false, true, this.infoPathStyle),
                );
                this.texts.push(new Text3d(Vector3.add(anchorEnd, data.d65offset), 'sRGB', false, this.infoTextStyle));
            }
            this.getVericesCircleCoordinates(prop).forEach((coord) => this.circles.push(data.createCircle3dSRGB(coord, data.d65offset, this.config.data.radius * 1.5)));
            this.getEdgesCircleCoordinates(prop).forEach((coord) => this.circles.push(data.createCircle3dSRGB(coord, data.d65offset, this.config.data.radius)));
        }
        if (this.config.data.showAdobeRGB) {
            const prop = data.dotProp.adobeRGB;
            if (this.config.data.showInfo) {
                const anchorStart = prop.green.position;
                const anchorEnd: Vector3 = { x: 6, y: anchorStart.y + 0.2, z: 0 };
                this.paths.push(
                    new Path3d(this.translatePathByOffset([prop.red.position, prop.green.position, prop.blue.position], data.d65offset), true, true, this.rectanglePathStyle),
                    new Path3d(this.translatePathByOffset([anchorStart, anchorEnd], data.d65offset), false, true, this.infoPathStyle),
                );
                this.texts.push(new Text3d(Vector3.add(anchorEnd, data.d65offset), 'Adobe RGB', false, this.infoTextStyle));
            }
            this.getVericesCircleCoordinates(prop).forEach((coord) => this.circles.push(data.createCircle3dAdobeRGB(coord, data.d65offset, this.config.data.radius * 1.5)));
            this.getEdgesCircleCoordinates(prop).forEach((coord) => this.circles.push(data.createCircle3dAdobeRGB(coord, data.d65offset, this.config.data.radius)));
        }
        if (this.config.data.showP3) {
            const prop = data.dotProp.p3;
            if (this.config.data.showInfo) {
                const anchorStart = prop.green.position;
                const anchorEnd: Vector3 = { x: 6, y: anchorStart.y - 0.25, z: 0 };
                this.paths.push(
                    new Path3d(this.translatePathByOffset([prop.red.position, prop.green.position, prop.blue.position], data.d65offset), true, true, this.rectanglePathStyle),
                    new Path3d(this.translatePathByOffset([anchorStart, anchorEnd], data.d65offset), false, true, this.infoPathStyle),
                );
                this.texts.push(new Text3d(Vector3.add(anchorEnd, data.d65offset), 'P3', false, this.infoTextStyle));
            }
            this.getVericesCircleCoordinates(prop).forEach((coord) => this.circles.push(data.createCircle3dP3(coord, data.d65offset, this.config.data.radius * 1.5)));
            this.getEdgesCircleCoordinates(prop).forEach((coord) => this.circles.push(data.createCircle3dP3(coord, data.d65offset, this.config.data.radius)));
        }
        if (this.config.data.showRec2020) {
            const prop = data.dotProp.rec2020;
            if (this.config.data.showInfo) {
                const anchorStart = prop.green.position;
                const anchorEnd: Vector3 = { x: 6, y: anchorStart.y, z: 0 };
                this.paths.push(
                    new Path3d(this.translatePathByOffset([prop.red.position, prop.green.position, prop.blue.position], data.d65offset), true, true, this.rectanglePathStyle),
                    new Path3d(this.translatePathByOffset([anchorStart, anchorEnd], data.d65offset), false, true, this.infoPathStyle),
                );
                this.texts.push(new Text3d(Vector3.add(anchorEnd, data.d65offset), 'Rec2020', false, this.infoTextStyle));
            }
            this.getVericesCircleCoordinates(prop).forEach((coord) => this.circles.push(data.createCircle3dRec2020(coord, data.d65offset, this.config.data.radius * 1.5)));
            this.getEdgesCircleCoordinates(prop).forEach((coord) => this.circles.push(data.createCircle3dRec2020(coord, data.d65offset, this.config.data.radius)));
        }
    }

    override config = new ModuleConfig<ColorSpaces2DConfig>(
        {
            cameraPerspective: {
                position: { x: 0, y: 1, z: -4.5 },
                angleX: 0,
                angleY: 0,
                angleZ: 0,
                fov: 90,
                type: 'Orbit',
            },
            radius: 2,
            density: 75,
            showInfo: true,
            showSRGB: true,
            showAdobeRGB: true,
            showP3: true,
            showRec2020: false,
        },
        "colorSpaces2DConfig",
        [
            CREATE.createFloatField('radius', 'Dot Radius', '', 0.2, 10),
            CREATE.createIntegerField('density', 'Dot Density', '', 0, 100),
            CREATE.createBoolField('showInfo', 'Show Info'),
            CREATE.createBoolField('showSRGB', 'sRGB'),
            CREATE.createBoolField('showAdobeRGB', 'Adobe RGB'),
            CREATE.createBoolField('showP3', 'P3'),
            CREATE.createBoolField('showRec2020', 'Rec2020', 'Currently only supported on dsplays you cannot afford anyway'),
        ]
    );

    override backgroundColor = '#f8f8ff';

    public transitionToStateAt(t: number): void {
        // Nothing to do here
    }

    private getVericesCircleCoordinates(prop: MainColorProperties): Vector3[] {
        return [
            prop.red.position,
            prop.green.position,
            prop.blue.position,
        ];
    }

    private getEdgesCircleCoordinates(prop: MainColorProperties): Vector3[] {
        const d = this.config.data.density;
        const edges: [Vector3, Vector3][] = [
            [prop.red.position, prop.green.position],
            [prop.green.position, prop.blue.position],
            [prop.blue.position, prop.red.position],
        ];
        return edges.flatMap(([a, b]) => Vector3.interpolateByDensity(a, b, d, this.config.data.radius));
    }

    private translatePathByOffset(path: Vector3[], offset: Vector3): Vector3[] {
        return path.map((point) => {
            return Vector3.add(point, offset);
        });
    }
}
