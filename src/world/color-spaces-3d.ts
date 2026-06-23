import { InitializeAfterConstruct } from '../../shared';
import { ModuleConfig } from '../../shared/config';
import { ONE_DEGREE } from '../types/constants';
import { Circle3d, circleStyle } from '../types/shape/circle';
import { Path3d, pathStyle } from '../types/shape/path';
import { Vector3 } from '../types/vector-3';
import { ColorSpaces3dData } from './color-spaces-3d.data';
import { MainColorProperties } from './color-spaces.data';
import { CREATE } from './ui/world-config-field-creator';
import { World, WorldConfig } from './world';

enum SliceStep {
    STEP_2 = '2',
    STEP_3 = '3',
    STEP_4 = '4',
    STEP_6 = '6',
    STEP_8 = '8',
    STEP_12 = '12',
    STEP_16 = '16',
    STEP_24 = '24',
    STEP_32 = '32',
    STEP_48 = '48',
    STEP_96 = '96',
    NONE = 'None',
}

interface ColorSpaces3DConfig extends WorldConfig {
    sliceStep: SliceStep;
    radius: number;
    density: number;
    showInfo: boolean;
    showSRGB: boolean;
    pyradmidColorSRGB: string;
    showAdobeRGB: boolean;
    pyradmidColorAdobeRGB: string;
    showP3: boolean;
    pyradmidColorP3: string;
    showRec2020: boolean;
    pyradmidColorRec2020: string;
}

@InitializeAfterConstruct()
export class ColorSpaces3D extends World {

    private d65CircleStyle = circleStyle()
        .fill('#fff')
        .strokeWidth(1)
        .stroke('#bbb')
        .get();

    private pathStyle = pathStyle()
        .stroke('#bbb')
        .strokeOpacity(0.5)
        .strokeWidth(2)
        .get();

    constructor() {
        super();
        const data = new ColorSpaces3dData();
        const skeleton = data.generateMacAdamSkeleton(2, Number(this.config.data.sliceStep), 120);

        this.circles = [new Circle3d(Vector3.origin(), 5, this.d65CircleStyle)];
        this.paths = skeleton.map((pathData) => { return new Path3d(this.translatePathByOffset(pathData, data.d65offset), true, true, this.pathStyle); });
        this.paths.push(new Path3d(this.translatePathByOffset(data.whiteAxis, data.d65offset), true, true, this.pathStyle));

        if (this.config.data.showSRGB) {
            const prop = data.dotProp.sRGB;
            if (this.config.data.showInfo) {
                this.paths.push(new Path3d(this.translatePathByOffset(this.getBipyramidPath(prop), data.d65offset), false, true, this.createColoredPathStyle(this.config.data.pyradmidColorSRGB)));
            }
            this.getVericesCircleCoordinates(prop).forEach((coord) => this.circles.push(data.createCircle3dSRGB(coord, data.d65offset, this.config.data.radius * 1.5)));
            this.getEdgesCircleCoordinates(prop).forEach((coord) => this.circles.push(data.createCircle3dSRGB(coord, data.d65offset, this.config.data.radius)));
        }
        if (this.config.data.showAdobeRGB) {
            const prop = data.dotProp.adobeRGB;
            if (this.config.data.showInfo) {
                this.paths.push(new Path3d(this.translatePathByOffset(this.getBipyramidPath(prop), data.d65offset), false, true, this.createColoredPathStyle(this.config.data.pyradmidColorAdobeRGB)));
            }
            this.getVericesCircleCoordinates(prop).forEach((coord) => this.circles.push(data.createCircle3dAdobeRGB(coord, data.d65offset, this.config.data.radius * 1.5)));
            this.getEdgesCircleCoordinates(prop).forEach((coord) => this.circles.push(data.createCircle3dAdobeRGB(coord, data.d65offset, this.config.data.radius)));
        }
        if (this.config.data.showP3) {
            const prop = data.dotProp.p3;
            if (this.config.data.showInfo) {
                this.paths.push(new Path3d(this.translatePathByOffset(this.getBipyramidPath(prop), data.d65offset), false, true, this.createColoredPathStyle(this.config.data.pyradmidColorP3)));
            }
            this.getVericesCircleCoordinates(prop).forEach((coord) => this.circles.push(data.createCircle3dP3(coord, data.d65offset, this.config.data.radius * 1.5)));
            this.getEdgesCircleCoordinates(prop).forEach((coord) => this.circles.push(data.createCircle3dP3(coord, data.d65offset, this.config.data.radius)));
        }
        if (this.config.data.showRec2020) {
            const prop = data.dotProp.rec2020;
            if (this.config.data.showInfo) {
                this.paths.push(new Path3d(this.translatePathByOffset(this.getBipyramidPath(prop), data.d65offset), false, true, this.createColoredPathStyle(this.config.data.pyradmidColorRec2020)));
            }
            this.getVericesCircleCoordinates(prop).forEach((coord) => this.circles.push(data.createCircle3dRec2020(coord, data.d65offset, this.config.data.radius * 1.5)));
            this.getEdgesCircleCoordinates(prop).forEach((coord) => this.circles.push(data.createCircle3dRec2020(coord, data.d65offset, this.config.data.radius)));
        }
    }

    override config = new ModuleConfig<ColorSpaces3DConfig>(
        {
            cameraPerspective: {
                position: { x: 0, y: -2, z: -20 },
                angleX: 30 * ONE_DEGREE,
                angleY: 45 * ONE_DEGREE,
                angleZ: 0,
                fov: 50,
                type: 'Orbit',
            },
            sliceStep: SliceStep.STEP_8,
            radius: 2,
            density: 50,
            showInfo: true,
            showSRGB: true,
            pyradmidColorSRGB: '#888',
            showAdobeRGB: false,
            pyradmidColorAdobeRGB: '#0f0',
            showP3: false,
            pyradmidColorP3: '#00f',
            showRec2020: false,
            pyradmidColorRec2020: '#f00',
        },
        "colorSpaces3DConfig",
        [
            CREATE.createEnumField('sliceStep', SliceStep, 'Solid Slice Step', 'Slice steps for the Rösch-MacAdam Color-Space Skeleton'),
            CREATE.createFloatField('radius', 'Dot Radius', '', 0.2, 10),
            CREATE.createIntegerField('density', 'Dot Density', '', 0, 100),
            CREATE.createBoolField('showInfo', 'Show Bipyramids'),
            CREATE.createBoolField('showSRGB', 'sRGB'),
            CREATE.createColorField('pyradmidColorSRGB', 'Color', 'Bipyramid Color for sRGB'),
            CREATE.createBoolField('showAdobeRGB', 'Adobe RGB'),
            CREATE.createColorField('pyradmidColorAdobeRGB', 'Color', 'Bipyramid Color for AdobeRGB'),
            CREATE.createBoolField('showP3', 'P3'),
            CREATE.createColorField('pyradmidColorP3', 'Color', 'Bipyramid Color for P3'),
            CREATE.createBoolField('showRec2020', 'Rec2020', 'Currently only supported on dsplays you cannot afford anyway'),
            CREATE.createColorField('pyradmidColorRec2020', 'Color', 'Bipyramid Color for Rec2020'),
        ],
    );

    override backgroundColor = '#f8f8ff';

    public transitionToStateAt(t: number): void {
        // Nothing to do here
    }

    private translatePathByOffset(path: Vector3[], offset: Vector3): Vector3[] {
        return path.map((point) => {
            return Vector3.add(point, offset);
        });
    }

    private getBipyramidPath(prop: MainColorProperties): Vector3[] {
        return [
            prop.black.position,
            prop.green.position,
            prop.red.position,
            prop.white.position,
            prop.green.position,
            prop.blue.position,
            prop.red.position,
            prop.black.position,
            prop.blue.position,
            prop.white.position,
        ];
    }

    private getVericesCircleCoordinates(prop: MainColorProperties): Vector3[] {
        return [
            prop.black.position,
            prop.white.position,
            prop.red.position,
            prop.green.position,
            prop.blue.position,
        ];
    }

    private getEdgesCircleCoordinates(prop: MainColorProperties): Vector3[] {
        const d = this.config.data.density; // 0-10
        const edges: [Vector3, Vector3][] = [
            [prop.black.position, prop.red.position],
            [prop.black.position, prop.green.position],
            [prop.black.position, prop.blue.position],
            [prop.white.position, prop.red.position],
            [prop.white.position, prop.green.position],
            [prop.white.position, prop.blue.position],
            [prop.red.position, prop.green.position],
            [prop.green.position, prop.blue.position],
            [prop.blue.position, prop.red.position],
        ];
        return edges.flatMap(([a, b]) => Vector3.interpolateByDensity(a, b, d, this.config.data.radius));
    }

    private createColoredPathStyle(color: string) {
        return pathStyle()
            .stroke(color)
            .strokeOpacity(0.4)
            .strokeWidth(2)
            .get();
    }
}
