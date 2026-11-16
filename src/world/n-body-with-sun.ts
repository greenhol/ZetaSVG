import { ModuleConfig } from '../../shared/config';
import { InitializeAfterConstruct } from '../../shared/initializable';
import { ONE_DEGREE } from '../types/constants';
import { Circle3d, circleStyle } from '../types/shape/circle';
import { Path3d, PathStyle, pathStyle } from '../types/shape/path';
import { Vector3 } from '../types/vector-3';
import { NBodyCalc } from './n-body.calc';
import { getPlanetColours } from './n-body.styles';
import { CREATE } from './ui/world-config-field-creator';
import { World, WorldConfig } from './world';

// Simulation (units are arbitrary "simulation units", not world units of the engine)
const GRAVITATIONAL_CONSTANT = 1;           // G, chosen as 1 so all numbers stay around 1
const MASS_MIN = 0.1;                       // smallest possible planet mass
const MASS_RATIO = 10;                      // largest possible planet mass = MASS_MIN * MASS_RATIO
const SOFTENING = 0.3;                      // softening length: caps the force at very close range, prevents numerical blow-ups
const SUBSTEPS_PER_TICK = 8;                // integration steps per frame, so dt = timePerTick / SUBSTEPS_PER_TICK
const REFERENCE_ORBIT_RADIUS = 4.5;           // a planet on a circular orbit at this distance from the sun sets the speed of the whole simulation
const REFERENCE_ORBIT_TICKS = 600;          // frames for one such orbit (600 -> 10 s at 60 fps). Orbits further in are faster, further out slower

// Sun
const SUN_MASS_FACTOR = 6;                  // sun mass = this * total mass of all planets. Higher = calmer and more ordered, lower = more chaotic
const SUN_FIXED = false;                    // true: the sun never moves. false: the sun is pulled by the planets and wobbles slightly

// Initial conditions
const ORBIT_RADIUS_MIN = 3;                 // planets start at least this far from the sun (world units)
const ORBIT_RADIUS_MAX = 6;                 // planets start at most this far from the sun (world units)
const MIN_SPAWN_DISTANCE = 0.6;             // minimum distance between two planets at the start
const ORBIT_AXIS: Vector3 = { x: 1, y: 0.3, z: 0.3 }; // axis all planets rotate around (is normalized in code), with the default camera it is seen almost face-on
const ORBIT_RANDOMNESS = 0.25;              // 0 = all planets start on circular orbits, 0.4 = clearly eccentric and tilted, above 0.4 some may escape

// Look
const PLANET_RADIUS_MAX = 4;                // circle radius of the heaviest possible planet (screen-scaled, see calibration notes)
const PLANET_STROKE_WIDTH = 0;            // outline width of the planets

// Streaks (only planets have them, the sun hardly moves)
const STREAK_CHUNKS = 5;                    // paths per planet; several short paths give correct depth sorting and allow a fade
const STREAK_SEGMENTS_PER_CHUNK = 20;       // line segments per path
const STREAK_SAMPLE_INTERVAL = 2;           // a streak point is stored every n ticks (2 -> 30 points per second at 60 fps)
const STREAK_WIDTH = 0.8;                   // stroke width of the newest path
const STREAK_MIN_WIDTH_FACTOR = 0.3;        // width of the oldest path relative to the newest one
const STREAK_SAMPLES = STREAK_CHUNKS * STREAK_SEGMENTS_PER_CHUNK; // stored points per planet (total streak length)

const SUN_INDEX = 0;                        // body 0 of the calculation is the sun, bodies 1 and up are the planets

interface NBodyWithSunConfig extends WorldConfig {
    bodyCount: number;
}

@InitializeAfterConstruct()
export class NBodyWithSun extends World {

    private _calc: NBodyCalc;
    private _planetColours: string[];
    private _streaks: Path3d[][];      // [body][chunk], chunk 0 is the newest. Empty for the sun

    constructor() {
        super();

        this._planetColours = getPlanetColours(this.config.data.bodyCount + 1);

        // Expected sun mass (average planet mass) is only used to pick a speed that looks the same for any number of planets
        const expectedSunMass = SUN_MASS_FACTOR * this.config.data.bodyCount * (MASS_MIN + MASS_MIN * MASS_RATIO) / 2;
        const referenceOrbitTime = 2 * Math.PI * Math.sqrt(Math.pow(REFERENCE_ORBIT_RADIUS, 3) / (GRAVITATIONAL_CONSTANT * expectedSunMass));

        this._calc = new NBodyCalc({
            bodyCount: this.config.data.bodyCount + 1,
            gravitationalConstant: GRAVITATIONAL_CONSTANT,
            softening: SOFTENING,
            timePerTick: referenceOrbitTime / REFERENCE_ORBIT_TICKS,
            substepsPerTick: SUBSTEPS_PER_TICK,
            streakSamples: STREAK_SAMPLES,
            streakSampleInterval: STREAK_SAMPLE_INTERVAL,
        });
        this._calc.createClusterWithCentralBody({
            massMin: MASS_MIN,
            massRatio: MASS_RATIO,
            sunMassFactor: SUN_MASS_FACTOR,
            orbitRadiusMin: ORBIT_RADIUS_MIN,
            orbitRadiusMax: ORBIT_RADIUS_MAX,
            minSpawnDistance: MIN_SPAWN_DISTANCE,
            orbitAxis: ORBIT_AXIS,
            randomness: ORBIT_RANDOMNESS,
        });
        this._calc.setFixed(SUN_INDEX, SUN_FIXED);

        this._streaks = [];

        this.build();
    }

    override config = new ModuleConfig<NBodyWithSunConfig>(
        {
            cameraPerspective: {
                position: { x: -0, y: 0, z: -11 },
                angleX: 0 * ONE_DEGREE,
                angleY: 90 * ONE_DEGREE,
                angleZ: 0 * ONE_DEGREE,
                fov: 90,
                type: 'Orbit',
            },
            bodyCount: 10,
        },
        'nBodyWithSunConfig',
        [
            CREATE.createIntegerField('bodyCount', 'Planets', 'Number of Planets', 1, 60),
        ],
    );

    override backgroundColour: string = '#000';

    public transitionToStateAt(t: number): void {
        this._calc.advanceTo(t);
        this.updateShapes();
    }

    private build(): void {
        // The sun is circle 0, so circle i belongs to calculation body i
        const sunStyle = circleStyle()
            .strokeWidth(3)
            .stroke('rgba(255, 231, 98, 1)')
            .strokeOpacity(.7)
            .fill('#ffca1aff')
            .get();
        const sunRadius = PLANET_RADIUS_MAX * Math.cbrt(this._calc.getMass(SUN_INDEX) / (MASS_MIN * MASS_RATIO));
        this.circles.push(new Circle3d(Vector3.origin(), sunRadius, sunStyle));
        this._streaks.push([]);

        for (let i = SUN_INDEX + 1; i < this._calc.bodyCount; i++) {
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

            for (let k = 0; k < this._streaks[i].length; k++) {
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
