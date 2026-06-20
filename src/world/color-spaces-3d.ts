import { InitializeAfterConstruct } from '../../shared';
import { ModuleConfig } from '../../shared/config';
import { ONE_DEGREE } from '../types/constants';
import { Circle3d, circleStyle } from '../types/shape/circle';
import { Group3d, SortBy } from '../types/shape/group';
import { Path3d, pathStyle } from '../types/shape/path';
import { Vector3 } from '../types/vector-3';
import { generateMacAdamSkeleton } from './color-spaces-3d.data';
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
        .strokeWidth(0.2)
        .stroke('#99f')
        .get();

    private pathStyle = pathStyle()
        .stroke('#99f')
        .strokeOpacity(0.5)
        .strokeWidth(3)
        .get();

    constructor() {
        super();
        const data = generateMacAdamSkeleton(2, Number(this.config.data.sliceStep), 120);

        const circlesInGroup = [new Circle3d({ x: this.d65x, y: this.d65y, z: this.d65z }, 5, this.d65CircleStyle)];
        const pathsInGroup = data.map((pathData) => { return new Path3d(pathData, true, true, this.pathStyle); });
        pathsInGroup.push(new Path3d(this.whiteAxis, true, true, this.pathStyle));

        this.groups.push(
            new Group3d(
                this.d65offset,
                [...pathsInGroup, ...circlesInGroup],
                SortBy.DISTANCE,
            )
        );
    }

    override config = new ModuleConfig<ColorSpaces3DConfig>(
        {
            cameraPerspective: {
                position: { x: 0, y: -2, z: -10 },
                angleX: 30 * ONE_DEGREE,
                angleY: 45 * ONE_DEGREE,
                angleZ: 0,
                fov: 90,
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
}
