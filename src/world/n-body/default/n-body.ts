import { ModuleConfig } from '../../../../shared/config';
import { InitializeAfterConstruct } from '../../../../shared/initializable';
import { ONE_DEGREE } from '../../../types/constants';
import { Circle3d, circleStyle } from '../../../types/shape/circle';
import { Path3d, PathStyle, pathStyle } from '../../../types/shape/path';
import { Vector3 } from '../../../types/vector-3';
import { CREATE } from '../../ui/world-config-field-creator';
import { World, WorldConfig } from '../../world';
import { NBodyCalc } from '../n-body.calc';
import { getPlanetColours } from '../n-body.styles';

// Simulation (units are arbitrary "simulation units", not world units of the engine)
const GRAVITATIONAL_CONSTANT = 1;           // G, chosen as 1 so all numbers stay around 1
const MASS_MIN = 0.1;                       // smallest possible planet mass
const MASS_RATIO = 10;                      // largest possible mass = MASS_MIN * MASS_RATIO
const SOFTENING = 0.3;                      // softening length: caps the force at very close range, prevents numerical blow-ups
const TIME_PER_TICK = 0.1;                  // simulated time per animation frame (~1 sim unit per second at 60 fps)
const SUBSTEPS_PER_TICK = 8;                // integration steps per frame, so dt = TIME_PER_TICK / SUBSTEPS_PER_TICK

// Initial conditions
const SPAWN_RADIUS = 4;                   // planets start inside a sphere of this radius (world units)
const MIN_SPAWN_DISTANCE = 2;             // minimum distance between two planets at the start
const VIRIAL_RATIO = 0.55;                  // kinetic / |potential| energy. 0.5 = balanced, lower = more bound, higher = more escapes
const SWIRL_STRENGTH = 1.8;                 // share of common rotation in the initial velocities (0 = purely random directions)
const SWIRL_AXIS: Vector3 = { x: 1, y: 0.3, z: 0.3 }; // axis of that common rotation (is normalized in code)

// Look
const PLANET_RADIUS_MAX = 4;                // circle radius of the heaviest possible planet (screen-scaled, see calibration notes)
const PLANET_STROKE_WIDTH = 0;            // outline width of the planets

// Streaks
const STREAK_CHUNKS = 5;                    // paths per planet; several short paths give correct depth sorting and allow a fade
const STREAK_SEGMENTS_PER_CHUNK = 20;       // line segments per path
const STREAK_SAMPLE_INTERVAL = 2;           // a streak point is stored every n ticks (2 -> 30 points per second at 60 fps)
const STREAK_WIDTH = 1.2;                   // stroke width of the newest path
const STREAK_MIN_WIDTH_FACTOR = 0.3;        // width of the oldest path relative to the newest one
const STREAK_SAMPLES = STREAK_CHUNKS * STREAK_SEGMENTS_PER_CHUNK; // stored points per planet (total streak length)

interface NBodyConfig extends WorldConfig {
    bodyCount: number;
}

@InitializeAfterConstruct()
export class NBody extends World {

    private _calc: NBodyCalc;
    private _planetColours: string[];
    private _streaks: Path3d[][];      // [planet][chunk], chunk 0 is the newest

    constructor() {
        super();

        this._planetColours = getPlanetColours(this.config.data.bodyCount);
        this._calc = new NBodyCalc({
            bodyCount: this.config.data.bodyCount,
            gravitationalConstant: GRAVITATIONAL_CONSTANT,
            softening: SOFTENING,
            timePerTick: TIME_PER_TICK,
            substepsPerTick: SUBSTEPS_PER_TICK,
            streakSamples: STREAK_SAMPLES,
            streakSampleInterval: STREAK_SAMPLE_INTERVAL,
        });
        this._calc.createRandomCluster({
            massMin: MASS_MIN,
            massRatio: MASS_RATIO,
            spawnRadius: SPAWN_RADIUS,
            minSpawnDistance: MIN_SPAWN_DISTANCE,
            virialRatio: VIRIAL_RATIO,
            swirlStrength: SWIRL_STRENGTH,
            swirlAxis: SWIRL_AXIS,
        });

        this._streaks = [];

        this.build();
    }

    override config = new ModuleConfig<NBodyConfig>(
        {
            cameraPerspective: {
                position: { x: -0, y: 0, z: -8.2 },
                angleX: 0 * ONE_DEGREE,
                angleY: 90 * ONE_DEGREE,
                angleZ: 0 * ONE_DEGREE,
                fov: 90,
                type: 'Orbit',
            },
            bodyCount: 5,
        },
        'nBodyConfig',
        [
            CREATE.createIntegerField('bodyCount', 'Bodies', 'Number of Bodies', 2, 60),
        ],
    );

    override backgroundColour: string = '#000';

    public transitionToStateAt(t: number): void {
        this._calc.advanceTo(t);
        this.updateShapes();
    }

    private build(): void {
        for (let i = 0; i < this._calc.bodyCount; i++) {
            const radius = PLANET_RADIUS_MAX * Math.cbrt(this._calc.getMass(i) / (MASS_MIN * MASS_RATIO)); // equal density -> radius ~ cube root of mass
            const planetStyle = circleStyle()
                .strokeWidth(PLANET_STROKE_WIDTH)
                .fill(this._planetColours[i])
                .get();
            this.circles.push(new Circle3d(Vector3.origin(), radius, planetStyle));

            const streaks: Path3d[] = [];
            for (let k = 0; k < STREAK_CHUNKS; k++) {
                const path = new Path3d(
                    [Vector3.origin(), Vector3.origin()],
                    false,
                    false,
                    this.streakStyle(this._planetColours[i], k),
                    false,
                );
                streaks.push(path);
                this.paths.push(path);
            }
            this._streaks.push(streaks);
        }

        this.updateShapes();
    }

    private streakStyle(colour: string, chunk: number): PathStyle {
        const fade = 1 - chunk / STREAK_CHUNKS; // 1 for the newest chunk, towards 0 for the oldest
        return pathStyle()
            .strokeWidth(STREAK_WIDTH * (STREAK_MIN_WIDTH_FACTOR + (1 - STREAK_MIN_WIDTH_FACTOR) * fade))
            .stroke(colour)
            .strokeOpacity(fade)
            .strokeLinecap('round')
            .get();
    }

    private updateShapes(): void {
        for (let i = 0; i < this._calc.bodyCount; i++) {
            this.circles[i].position = this._calc.getPosition(i);

            for (let k = 0; k < STREAK_CHUNKS; k++) {
                const points = this._calc.getStreakPoints(i, k * STREAK_SEGMENTS_PER_CHUNK, STREAK_SEGMENTS_PER_CHUNK);
                const streak = this._streaks[i][k];
                if (points.length < 2) {
                    streak.visible = false; // not enough history yet
                    continue;
                }
                streak.path = points;
                streak.visible = true;
            }
        }
    }
}
