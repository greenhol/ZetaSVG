import { ModuleConfig } from '../../shared/config';
import { InitializeAfterConstruct } from '../../shared/initializable';
import { ONE_DEGREE } from '../types/constants';
import { Circle3d, circleStyle } from '../types/shape/circle';
import { Path3d, pathStyle } from '../types/shape/path';
import { Vector3 } from '../types/vector-3';
import { CREATE } from './ui/world-config-field-creator';
import { World, WorldConfig } from './world';

// Geometry
const POINTS_PER_PATH = 15;                 // support points of one path segment
const SEGMENTS_PER_CURVE = 24;          // path segments per curve
const AMPLITUDE_OUTER = 3.0;                // half-size of the first (outermost) curve, must stay inside ~5
const AMPLITUDE_INNER = 1.5;                // half-size of the last (innermost) curve
const BASE_PHASES: [number, number, number] = [0, 35 * ONE_DEGREE, 80 * ONE_DEGREE]; // start phase of x, y and z (must NOT be multiples of 90°, otherwise some curves retrace themselves and get open ends)

// Frequency ratios [a, b, c] for x, y, z. Integers only, so every curve is closed. Reused cyclically.
const FREQUENCIES: [number, number, number][] = [
    [3, 2, 1],
    [5, 4, 3],
    [2, 3, 5],
    [4, 3, 2],
    [3, 5, 4],
    [5, 2, 3],
];

// Animation
const LOOP_TICKS = 3600;                    // whole animation repeats after this many ticks (3600 ticks = 60 s at 60 fps)
const DRIFT_TURNS_PER_LOOP = [0, 0, 0, 0, 0, 0]; // full turns of the z phase per loop, per curve (integer = seamless loop). 1 turn = 60 s
const TRACER_LAPS_PER_LOOP = 3;             // laps of each tracer dot per loop (3 laps = 20 s per lap)

// Look
const PATH_WIDTH = .8;                     // stroke width of the curves
const TRACER_RADIUS = 4;                    // radius of the tracer dots (circle sizes are not in world units)
const TRACER_STROKE_WIDTH = 0.5;            // outline of the tracer dots
const TRACER_FILL = '#ffffff';              // fill of all tracer dots
const CURVE_COLOURS = [                     // 21 colours = 7 hues x 3 brightness levels, ordered so neighbouring curves differ. Reused cyclically beyond 21.
    // Round 1: clearly coloured, still bright
    '#ffd966', '#66ceff', '#ff6676', '#66ffad', '#ff66fa', '#a2ff66', '#8166ff',
    // Round 2: a bit less saturated    
    '#ffe699', '#99deff', '#ff99a4', '#99ffc8', '#ff99fb', '#c1ff99', '#ab99ff',
    // Round 3: almost white    
    '#fff2cc', '#ccefff', '#ffccd1', '#ccffe4', '#ffccfd', '#e0ffcc', '#d5ccff',
];

interface Curve {
    frequencies: [number, number, number];
    amplitude: number;
    driftTurns: number;                     // turns of the z phase per loop
    tracerOffset: number;                   // start position of the tracer as a fraction of one lap
    segments: Path3d[];
    tracer: Circle3d;
}

interface LissajousConfig extends WorldConfig {
    curveCount: number;
}

@InitializeAfterConstruct()
export class Lissajous extends World {

    private _curves: Curve[] = [];

    constructor() {
        super();
        this.build();
    }

    override config = new ModuleConfig<LissajousConfig>(
        {
            cameraPerspective: {
                position: { x: -0, y: 0, z: -6.5 },
                angleX: 0 * ONE_DEGREE,
                angleY: 95 * ONE_DEGREE,
                angleZ: 0 * ONE_DEGREE,
                fov: 90,
                type: 'Orbit',
            },
            curveCount: 3,
        },
        'lissajousConfig',
        [
            CREATE.createIntegerField('curveCount', 'Curves', 'Number of Curves', 1, 21),
        ]
    );

    override backgroundColour: string = '#241f1f';

    public transitionToStateAt(t: number): void {
        this.update(t);
    }

    private build(): void {
        for (let i = 0; i < this.config.data.curveCount; i++) {
            const colour = CURVE_COLOURS[i % CURVE_COLOURS.length];

            const segmentStyle = pathStyle()
                .strokeWidth(PATH_WIDTH)
                .stroke(colour)
                .strokeLinecap('round')
                .strokeLinejoin('round')
                .get();

            const tracerStyle = circleStyle()
                .strokeWidth(TRACER_STROKE_WIDTH)
                .stroke(colour)
                .fill(TRACER_FILL)
                .fillOpacity(0.7)
                .get();

            const segments: Path3d[] = [];
            for (let k = 0; k < SEGMENTS_PER_CURVE; k++) {
                segments.push(new Path3d([], false, false, segmentStyle));
            }
            const tracer = new Circle3d({ x: 0, y: 0, z: 0 }, TRACER_RADIUS, tracerStyle);

            this.paths.push(...segments);
            this.circles.push(tracer);

            // Amplitudes are spread evenly from outer to inner
            const amplitude = this.config.data.curveCount === 1
                ? AMPLITUDE_OUTER
                : AMPLITUDE_OUTER + (AMPLITUDE_INNER - AMPLITUDE_OUTER) * i / (this.config.data.curveCount - 1);

            this._curves.push({
                frequencies: FREQUENCIES[i % FREQUENCIES.length],
                amplitude,
                driftTurns: DRIFT_TURNS_PER_LOOP[i % DRIFT_TURNS_PER_LOOP.length],
                tracerOffset: i / this.config.data.curveCount,
                segments,
                tracer,
            });
        }

        this.update(0);
    }

    private update(t: number): void {

        const POINTS_PER_CURVE = SEGMENTS_PER_CURVE * (POINTS_PER_PATH - 1) + 1; // segments share their end points

        // 0..1 position inside the loop, so everything is a periodic function of t
        const loopProgress = (t % LOOP_TICKS) / LOOP_TICKS;

        for (const curve of this._curves) {
            const drift = 2 * Math.PI * curve.driftTurns * loopProgress;

            // Sample the whole curve once, then cut it into overlapping segments
            const points: Vector3[] = [];
            for (let j = 0; j < POINTS_PER_CURVE; j++) {
                const s = 2 * Math.PI * j / (POINTS_PER_CURVE - 1);
                points.push(this.point(curve, s, drift));
            }
            curve.segments.forEach((segment, k) => {
                const start = k * (POINTS_PER_PATH - 1);
                segment.path = points.slice(start, start + POINTS_PER_PATH);
            });

            // Tracer runs along the curve with constant speed in the curve parameter
            const tracerS = 2 * Math.PI * (TRACER_LAPS_PER_LOOP * loopProgress + curve.tracerOffset);
            curve.tracer.position = this.point(curve, tracerS, drift);
        }
    }

    /** Point of a curve at curve parameter s (0..2π is one closed run). The drift is added to the z phase. */
    private point(curve: Curve, s: number, drift: number): Vector3 {
        const [a, b, c] = curve.frequencies;
        const [phaseX, phaseY, phaseZ] = BASE_PHASES;
        return {
            x: curve.amplitude * Math.sin(a * s + phaseX),
            y: curve.amplitude * Math.sin(b * s + phaseY),
            z: curve.amplitude * Math.sin(c * s + phaseZ + drift),
        };
    }
}
