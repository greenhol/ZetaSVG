import { InitializeAfterConstruct } from '../../shared';
import { ModuleConfig } from '../../shared/config';
import { ONE_DEGREE } from '../types/constants';
import { Circle3d } from '../types/shape/circle';
import { CREATE } from './ui/world-config-field-creator';
import { World, WorldConfig } from './world';

interface DotCubeConfig extends WorldConfig {
    size: number;
    distance: number;
    radius: number;
};

@InitializeAfterConstruct()
export class DotCube extends World {
    public constructor() {
        super();

        const edge = this.config.data.size * this.config.data.distance;
        for (let i = -edge; i <= edge; i += this.config.data.distance) {
            for (let j = -edge; j <= edge; j += this.config.data.distance) {
                for (let k = -edge; k <= edge; k += this.config.data.distance) {
                    this.circles.push(new Circle3d({ x: i, y: j, z: k }, this.config.data.radius));
                }
            }
        }
    }

    override config = new ModuleConfig<DotCubeConfig>(
        {
            cameraPerspective: {
                position: { x: 0, y: 0, z: -3 },
                angleX: 30 * ONE_DEGREE,
                angleY: 60 * ONE_DEGREE,
                angleZ: 0,
                fov: 90,
                type: 'Orbit',
            },
            size: 6,
            distance: 0.2,
            radius: 1.5,
        },
        "dotCubeConfig",
        [
            CREATE.createIntegerField('size', 'Size', 'Size of cube (still depending on distance)', 1, 50),
            CREATE.createFloatField('distance', 'Distance', 'Distance between dots', 0.01, 100),
            CREATE.createFloatField('radius', 'Radius', 'Radius of a single dot', 0.1, 10),
        ]
    );

    public transitionToStateAt(t: number): void {
        // Do Nothing
    }
}
