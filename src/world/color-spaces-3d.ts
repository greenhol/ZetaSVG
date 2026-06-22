import { InitializeAfterConstruct } from '../../shared';
import { ModuleConfig } from '../../shared/config';
import { ONE_DEGREE } from '../types/constants';
import { Circle3d, circleStyle } from '../types/shape/circle';
import { Group3d, SortBy } from '../types/shape/group';
import { Path3d, pathStyle } from '../types/shape/path';
import { Vector3 } from '../types/vector-3';
import { ColorSpaces3dData } from './color-spaces-3d.data';
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
    sliceStep: SliceStep,
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
        this.paths = skeleton.map((pathData) => { return new Path3d(this.translatePathByD65Offset(pathData, data.d65offset), true, true, this.pathStyle); });
        this.paths.push(new Path3d(this.translatePathByD65Offset(data.whiteAxis, data.d65offset), true, true, this.pathStyle));

        const pathsInGroup: Path3d[] = [
            new Path3d([data.dotProp.sRGB.black.position, data.dotProp.sRGB.red.position], false, true, this.pathStyle),
            new Path3d([data.dotProp.sRGB.black.position, data.dotProp.sRGB.green.position], false, true, this.pathStyle),
            new Path3d([data.dotProp.sRGB.black.position, data.dotProp.sRGB.blue.position], false, true, this.pathStyle),
            new Path3d([data.dotProp.sRGB.white.position, data.dotProp.sRGB.red.position], false, true, this.pathStyle),
            new Path3d([data.dotProp.sRGB.white.position, data.dotProp.sRGB.green.position], false, true, this.pathStyle),
            new Path3d([data.dotProp.sRGB.white.position, data.dotProp.sRGB.blue.position], false, true, this.pathStyle),
            new Path3d([data.dotProp.sRGB.red.position, data.dotProp.sRGB.green.position], false, true, this.pathStyle),
            new Path3d([data.dotProp.sRGB.green.position, data.dotProp.sRGB.blue.position], false, true, this.pathStyle),
            new Path3d([data.dotProp.sRGB.blue.position, data.dotProp.sRGB.red.position], false, true, this.pathStyle),
        ];
        const circlesInGroup: Circle3d[] = [
            data.createCircle3dSRGB(data.dotProp.sRGB.black.position, 3),
            data.createCircle3dSRGB(data.dotProp.sRGB.white.position, 3),
            data.createCircle3dSRGB(data.dotProp.sRGB.red.position, 3),
            data.createCircle3dSRGB(data.dotProp.sRGB.green.position, 3),
            data.createCircle3dSRGB(data.dotProp.sRGB.blue.position, 3),
        ];

        for (let t = 0.05; t < 1; t += 0.05) {
            const pos0R = Vector3.interpolate(data.dotProp.sRGB.black.position, data.dotProp.sRGB.red.position, t);
            circlesInGroup.push(data.createCircle3dSRGB(pos0R, 2));
            const pos0G = Vector3.interpolate(data.dotProp.sRGB.black.position, data.dotProp.sRGB.green.position, t);
            circlesInGroup.push(data.createCircle3dSRGB(pos0G, 2));
            const pos0B = Vector3.interpolate(data.dotProp.sRGB.black.position, data.dotProp.sRGB.blue.position, t);
            circlesInGroup.push(data.createCircle3dSRGB(pos0B, 2));

            const pos1R = Vector3.interpolate(data.dotProp.sRGB.white.position, data.dotProp.sRGB.red.position, t);
            circlesInGroup.push(data.createCircle3dSRGB(pos1R, 2));
            const pos1G = Vector3.interpolate(data.dotProp.sRGB.white.position, data.dotProp.sRGB.green.position, t);
            circlesInGroup.push(data.createCircle3dSRGB(pos1G, 2));
            const pos1B = Vector3.interpolate(data.dotProp.sRGB.white.position, data.dotProp.sRGB.blue.position, t);
            circlesInGroup.push(data.createCircle3dSRGB(pos1B, 2));

            const posRG = Vector3.interpolate(data.dotProp.sRGB.red.position, data.dotProp.sRGB.green.position, t);
            circlesInGroup.push(data.createCircle3dSRGB(posRG, 2));
            const posGB = Vector3.interpolate(data.dotProp.sRGB.green.position, data.dotProp.sRGB.blue.position, t);
            circlesInGroup.push(data.createCircle3dSRGB(posGB, 2));
            const posBR = Vector3.interpolate(data.dotProp.sRGB.blue.position, data.dotProp.sRGB.red.position, t);
            circlesInGroup.push(data.createCircle3dSRGB(posBR, 2));
        }

        this.groups = [
            new Group3d(
                data.d65offset,
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
        "colorSpaces3DConfig",
        [
            CREATE.createEnumField('sliceStep', SliceStep, 'Slice Step'),
        ],
    );

    override backgroundColor = '#f8f8ff';

    public transitionToStateAt(t: number): void {
        // Nothing to do here
    }

    private translatePointByOffset(point: Vector3, offset: Vector3): Vector3 {
        return Vector3.add(point, offset);
    }

    private translatePathByD65Offset(path: Vector3[], offset: Vector3): Vector3[] {
        return path.map((point) => {
            return this.translatePointByOffset(point, offset);
        });
    }
}
