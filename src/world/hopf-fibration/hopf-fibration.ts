import { ModuleConfig } from '../../../shared/config';
import { InitializeAfterConstruct } from '../../../shared/initializable';
import { ONE_DEGREE } from '../../types/constants';
import { Path3d, pathStyle, PathStyle } from '../../types/shape/path';
import { chunkPoints, CHUNKS_PER_FIBER, createFiberParams, exceedsMaxRadius, HopfMotion, sweptTheta, THETA_MAX, THETA_MIN } from './hopf-fibration.calc';
import { CREATE } from '../ui/world-config-field-creator';
import { World, WorldConfig } from '../world';

interface HopfConfig extends WorldConfig {
    latitudeCount: number;
    azimuthCount: number;
    motion: HopfMotion;
    speed: number;
}

// Animation
const FRAMES_PER_SECOND = 60;                                       // assumed frame rate for the "per tick" speeds below
const ROTATE_4D_PER_TICK = 0.3 / FRAMES_PER_SECOND;                 // 4D rotation angle per tick: 0.3 rad/s at 60 fps
const SWEEP_PHASE_PER_TICK = 0.4 / FRAMES_PER_SECOND;               // phase of the latitude sine per tick: 0.4 rad/s at 60 fps

// Look
const STROKE_WIDTH = 2.5;                                           // path stroke width
const STROKE_OPACITY = 0.8;                                         // fixed opacity of all chunks
const SATURATION = 85;                                              // HSL saturation in percent
const LIGHTNESS_MIN = 55;                                           // HSL lightness in percent at THETA_MIN
const LIGHTNESS_MAX = 70;                                           // HSL lightness in percent at THETA_MAX
const DEGREES_PER_TURN = 360;                                       // full hue range
const FULL_TURN = 2 * Math.PI;                                      // azimuth range in radians

interface Fiber {
    theta: number;
    phi: number;
    chunks: Path3d[];
}

@InitializeAfterConstruct()
export class HopfFibration extends World {

    private _fibers: Fiber[] = [];

    constructor() {
        super();
        this.build();
    }

    override config = new ModuleConfig<HopfConfig>(
        {
            cameraPerspective: {
                position: { x: 0, y: 0, z: -8 },
                angleX: 25 * ONE_DEGREE,
                angleY: 0 * ONE_DEGREE,
                angleZ: 0 * ONE_DEGREE,
                fov: 60,
                type: 'Orbit',
            },
            latitudeCount: 4,
            azimuthCount: 6,
            motion: HopfMotion.None,
            speed: 1,
        },
        'hopfFibrationConfig',
        [
            CREATE.createIntegerField('latitudeCount', 'Lat Count', 'Latitude Count', 3, 5),
            CREATE.createIntegerField('azimuthCount', 'Azm Count', 'Azimuth Count', 3, 10),
            CREATE.createEnumField('motion', HopfMotion, 'Motion', 'Motion to animate'),
            CREATE.createFloatField('speed', 'Speed', 'Animation Speed', 0, 100),
        ],
    );

    override backgroundColour: string = '#0a0f24';

    public transitionToStateAt(t: number): void {
        this.update(t * this.config.data.speed);
    }

    private build(): void {
        for (const params of createFiberParams(this.config.data.latitudeCount, this.config.data.azimuthCount)) {
            const style = this.fiberStyle(params.theta, params.phi);
            const chunks: Path3d[] = [];
            for (let k = 0; k < CHUNKS_PER_FIBER; k++) {
                chunks.push(new Path3d([], false, false, style));
            }
            this._fibers.push({ theta: params.theta, phi: params.phi, chunks });
            this.paths.push(...chunks);
        }

        this.update(0);
    }

    /** Fixed colour per fiber: hue from the azimuth, lightness from the latitude. */
    private fiberStyle(theta: number, phi: number): PathStyle {
        const hue = (phi / FULL_TURN) * DEGREES_PER_TURN;
        const lightness = LIGHTNESS_MIN + ((theta - THETA_MIN) / (THETA_MAX - THETA_MIN)) * (LIGHTNESS_MAX - LIGHTNESS_MIN);
        return pathStyle()
            .strokeWidth(STROKE_WIDTH)
            .stroke(`hsl(${hue}, ${SATURATION}%, ${lightness}%)`)
            .strokeOpacity(STROKE_OPACITY)
            .strokeLinecap('round')
            .strokeLinejoin('round')
            .get();
    }

    /** ticks = animation time in ticks, already multiplied by the speed factor. */
    private update(ticks: number): void {
        const motion = this.config.data.motion;
        const psi = motion === HopfMotion.Rotate4D ? ticks * ROTATE_4D_PER_TICK : 0;
        const sweep = motion === HopfMotion.SweepTheta ? Math.sin(ticks * SWEEP_PHASE_PER_TICK) : 0;

        for (const fiber of this._fibers) {
            const theta = motion === HopfMotion.SweepTheta ? sweptTheta(fiber.theta, sweep) : fiber.theta;
            for (let k = 0; k < CHUNKS_PER_FIBER; k++) {
                const points = chunkPoints(theta, fiber.phi, k, psi);
                const tooFar = exceedsMaxRadius(points);
                fiber.chunks[k].visible = !tooFar;
                if (!tooFar) {
                    fiber.chunks[k].path = points;
                }
            }
        }
    }
}
