import { InitializeAfterConstruct } from '../../shared';
import { ModuleConfig } from '../../shared/config';
import { ONE_DEGREE } from '../types/constants';
import { Circle3d, circleStyle } from '../types/shape/circle';
import { Group3d, SortBy } from '../types/shape/group';
import { Path3d, pathStyle } from '../types/shape/path';
import { Vector3 } from '../types/vector-3';
import { coloredDotProperties, createCircle3dSRGB, createCircle3dSRGB_old, generateMacAdamSkeleton } from './color-spaces-3d.data';
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
}

interface ColorSpaces3DConfig extends WorldConfig {
    sliceStep: SliceStep,
}

@InitializeAfterConstruct()
export class ColorSpaces3D extends World {

    private d65x = 4.752;
    private d65y = 5;
    private d65z = 5.444;
    private d65offset = { x: -this.d65x, y: -this.d65y, z: -this.d65z };
    private whiteAxis: Vector3[] = [
        { x: 0, y: 0, z: 0 }, // black
        { x: 9.504, y: 10, z: 10.888 }, // white (Y=100, scaled by 0.1)
    ];

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
        const data = generateMacAdamSkeleton(2, Number(this.config.data.sliceStep), 120);

        this.circles = [new Circle3d(Vector3.origin(), 5, this.d65CircleStyle)];
        this.paths = data.map((pathData) => { return new Path3d(this.translatePathByD65Offset(pathData), true, true, this.pathStyle); });
        this.paths.push(new Path3d(this.translatePathByD65Offset(this.whiteAxis), true, true, this.pathStyle));

        const pathsInGroup: Path3d[] = [
            new Path3d([coloredDotProperties.sRGB.black.position, coloredDotProperties.sRGB.red.position], false, true, this.pathStyle),
            new Path3d([coloredDotProperties.sRGB.black.position, coloredDotProperties.sRGB.green.position], false, true, this.pathStyle),
            new Path3d([coloredDotProperties.sRGB.black.position, coloredDotProperties.sRGB.blue.position], false, true, this.pathStyle),
            new Path3d([coloredDotProperties.sRGB.white.position, coloredDotProperties.sRGB.red.position], false, true, this.pathStyle),
            new Path3d([coloredDotProperties.sRGB.white.position, coloredDotProperties.sRGB.green.position], false, true, this.pathStyle),
            new Path3d([coloredDotProperties.sRGB.white.position, coloredDotProperties.sRGB.blue.position], false, true, this.pathStyle),
            new Path3d([coloredDotProperties.sRGB.red.position, coloredDotProperties.sRGB.green.position], false, true, this.pathStyle),
            new Path3d([coloredDotProperties.sRGB.green.position, coloredDotProperties.sRGB.blue.position], false, true, this.pathStyle),
            new Path3d([coloredDotProperties.sRGB.blue.position, coloredDotProperties.sRGB.red.position], false, true, this.pathStyle),
        ];
        const circlesInGroup: Circle3d[] = [
            createCircle3dSRGB_old(coloredDotProperties.sRGB.black),
            createCircle3dSRGB_old(coloredDotProperties.sRGB.white),
            createCircle3dSRGB_old(coloredDotProperties.sRGB.red),
            createCircle3dSRGB_old(coloredDotProperties.sRGB.green),
            createCircle3dSRGB_old(coloredDotProperties.sRGB.blue),
        ];

        for (let t = 0.05; t < 1; t += 0.05) {
            const pos0R = this.interpolate(coloredDotProperties.sRGB.black.position, coloredDotProperties.sRGB.red.position, t);
            circlesInGroup.push(createCircle3dSRGB(pos0R, 2));
            const pos0G = this.interpolate(coloredDotProperties.sRGB.black.position, coloredDotProperties.sRGB.green.position, t);
            circlesInGroup.push(createCircle3dSRGB(pos0G, 2));
            const pos0B = this.interpolate(coloredDotProperties.sRGB.black.position, coloredDotProperties.sRGB.blue.position, t);
            circlesInGroup.push(createCircle3dSRGB(pos0B, 2));

            const pos1R = this.interpolate(coloredDotProperties.sRGB.white.position, coloredDotProperties.sRGB.red.position, t);
            circlesInGroup.push(createCircle3dSRGB(pos1R, 2));
            const pos1G = this.interpolate(coloredDotProperties.sRGB.white.position, coloredDotProperties.sRGB.green.position, t);
            circlesInGroup.push(createCircle3dSRGB(pos1G, 2));
            const pos1B = this.interpolate(coloredDotProperties.sRGB.white.position, coloredDotProperties.sRGB.blue.position, t);
            circlesInGroup.push(createCircle3dSRGB(pos1B, 2));

            const posRG = this.interpolate(coloredDotProperties.sRGB.red.position, coloredDotProperties.sRGB.green.position, t);
            circlesInGroup.push(createCircle3dSRGB(posRG, 2));
            const posGB = this.interpolate(coloredDotProperties.sRGB.green.position, coloredDotProperties.sRGB.blue.position, t);
            circlesInGroup.push(createCircle3dSRGB(posGB, 2));
            const posBR = this.interpolate(coloredDotProperties.sRGB.blue.position, coloredDotProperties.sRGB.red.position, t);
            circlesInGroup.push(createCircle3dSRGB(posBR, 2));
        }

        this.groups = [
            new Group3d(
                this.d65offset,
                [...pathsInGroup, ...circlesInGroup],
                SortBy.DISTANCE,
            )
        ];
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
        },
        "colorSpaces3dConfig",
        [
            CREATE.createEnumField('sliceStep', SliceStep, 'Slice Step'),
        ],
    );

    override backgroundColor = '#f8f8ff';

    public transitionToStateAt(t: number): void {
        // Nothing to do here
    }

    private translatePointByD65Offset(point: Vector3): Vector3 {
        return Vector3.add(point, this.d65offset);
    }

    private translatePathByD65Offset(path: Vector3[]): Vector3[] {
        return path.map((point) => {
            return this.translatePointByD65Offset(point);
        });
    }

    private interpolate(pos1: Vector3, pos2: Vector3, t: number): Vector3 {
        return {
            x: pos1.x + t * (pos2.x - pos1.x),
            y: pos1.y + t * (pos2.y - pos1.y),
            z: pos1.z + t * (pos2.z - pos1.z),
        };
    }
}
