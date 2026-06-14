import { InitializeAfterConstruct } from '../../shared';
import { ModuleConfig } from '../../shared/config';
import { ONE_DEGREE } from '../types/constants';
import { Circle3d } from '../types/shape/circle';
import { World, WorldConfig } from './world';

@InitializeAfterConstruct()
export class DotCube extends World {
    private static SIZE = 1;
    private static DIST = 0.2;

    public constructor() {
        super();

        for (let i = -DotCube.SIZE; i <= DotCube.SIZE; i += DotCube.DIST) {
            for (let j = -DotCube.SIZE; j <= DotCube.SIZE; j += DotCube.DIST) {
                for (let k = -DotCube.SIZE; k <= DotCube.SIZE; k += DotCube.DIST) {
                    this.circles.push(new Circle3d({ x: i, y: j, z: k }, 1.5));
                }
            }
        }
    }

    override config = new ModuleConfig<WorldConfig>(
        {
            cameraPerspective: {
                position: { x: 0, y: 0, z: -3 },
                angleX: 30 * ONE_DEGREE,
                angleY: 60 * ONE_DEGREE,
                angleZ: 0,
                fov: 50,
                type: 'Orbit',
            },
        },
        "dotCubeConfig",
    );

    public transitionToStateAt(t: number): void {
        // Do Nothing
    }
}
