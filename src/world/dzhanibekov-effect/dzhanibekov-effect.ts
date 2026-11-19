import { ModuleConfig } from '../../../shared/config';
import { InitializeAfterConstruct } from '../../../shared/initializable';
import { ONE_DEGREE } from '../../types/constants';
import { Circle3d, circleStyle } from '../../types/shape/circle';
import { Path3d, PathStyle, pathStyle } from '../../types/shape/path';
import { Vector3 } from '../../types/vector-3';
import { clipLine3DByFactor } from '../../utils/clip-line-3d';
import { CREATE } from '../ui/world-config-field-creator';
import { World, WorldConfig } from '../world';
import { analyseBody, applyMatrix, hasIntermediateAxis, identityMatrix, Matrix3, PointMass, RigidBodySpin } from './dzhanibekov-effect.calc';

interface DzhanibekovEffectConfig extends WorldConfig {
    weightBarA: number,
    weightBarB: number,
    weightStem: number,
}

interface StreakPoint {
    point: Vector3,
    valid: boolean,
}

interface StreakPath {
    path: Vector3[],
    visible: boolean,
}

// Geometry
const BAR_HALF_LENGTH = 4;                  // world units: distance from the junction to each bar end
const STEM_LENGTH = 4;                      // world units: distance from the junction to the stem end

// Weights
const DEFAULT_WEIGHT = 5;                   // default for all three weights
const MIN_WEIGHT = 0;                       // lower limit of the numeric inputs
const MAX_WEIGHT = 10;                      // upper limit of the numeric inputs
const REFERENCE_WEIGHT = 5;                 // weight at which a circle has exactly the size given by the look constants

// Animation
const SPIN_PER_TICK = 3 * ONE_DEGREE;       // start spin around the intermediate axis: one tick = one frame -> 180° per second at 60 fps
const PERTURBATION = 0.1;                   // start spin around the other two axes, relative to SPIN_PER_TICK (smaller = longer wait before the first flip)
const SUBSTEPS_PER_TICK = 4;                // integration steps per tick
const MIN_RELATIVE_MOMENT_GAP = 0.02;       // below this relative gap between two principal moments the T is treated as non-flipping

// Look
const PATH_WIDTH = 8;                       // stroke width of the bar and the stem
const PATH_COLOUR = '#88a';
const PATH_OPACITY = 0.5;
const CIRCLE_RADIUS_AT_REFERENCE = 12;
const CIRCLE_STROKE_WIDTH = 4;
const CIRCLE_STROKE_COLOUR = '#f80';
const CIRCLE_FILL_COLOUR = '#fff';

// Streaks
const STREAK_LENGTH = 120;                  // ticks of history shown behind each weight (2 s at 60 fps)
const STREAK_OFFSET = 4;                    // the newest STREAK_OFFSET - 1 points are skipped, so the streak starts a little behind the circle
const STREAK_CHUNK_SIZE = 12;               // points per streak path, each chunk is one step in the fade
const STREAK_WIDTH = 2.4;                   // stroke width of the newest chunk (same 0.3 ratio to the path width as in the pendulum)
const STREAK_COLOUR = '#797';
const STREAK_POINT_COUNT = STREAK_LENGTH + STREAK_OFFSET;
const STREAK_FIRST_POINT = STREAK_OFFSET - 1;
const STREAK_CHUNK_COUNT = Math.ceil((STREAK_POINT_COUNT - STREAK_FIRST_POINT) / STREAK_CHUNK_SIZE);
const STREAK_FADE_STEP = STREAK_CHUNK_SIZE / STREAK_LENGTH; // fade lost from one chunk to the next

@InitializeAfterConstruct()
export class DzhanibekovEffect extends World {

    private _pathStyle = pathStyle()
        .strokeWidth(PATH_WIDTH)
        .stroke(PATH_COLOUR)
        .strokeOpacity(PATH_OPACITY)
        .strokeLinecap('round')
        .get();

    private _circleStyle = circleStyle()
        .strokeWidth(CIRCLE_STROKE_WIDTH)
        .stroke(CIRCLE_STROKE_COLOUR)
        .fill(CIRCLE_FILL_COLOUR)
        .get();

    private _circleBarA: Circle3d;
    private _circleBarB: Circle3d;
    private _circleStem: Circle3d;
    private _pathBar: Path3d;
    private _pathStem: Path3d;

    // Start positions relative to the centre of mass: [bar end A, bar end B, junction, stem end]
    private _restPoints: Vector3[] = [];

    // Start positions of the three weights (bar end A, bar end B, stem end) and their streak paths, newest chunk first
    private _streakSources: Vector3[] = [];
    private _streakPaths: Path3d[][] = [];

    // null if the weights do not allow a flip -> the T stays static
    private _spin: RigidBodySpin | null = null;

    constructor() {
        super();
        this.build();
    }

    override config = new ModuleConfig<DzhanibekovEffectConfig>(
        {
            cameraPerspective: {
                position: { x: -0, y: 0, z: -8.2 },
                angleX: 0 * ONE_DEGREE,
                angleY: 90 * ONE_DEGREE,
                angleZ: 0 * ONE_DEGREE,
                fov: 90,
                type: 'Orbit',
            },
            weightBarA: DEFAULT_WEIGHT,
            weightBarB: DEFAULT_WEIGHT,
            weightStem: DEFAULT_WEIGHT,
        },
        'dzhanibekovEffectConfig',
        [
            CREATE.createFloatField('weightBarA', 'Weight Bar End A', 'Weight of the first bar end. A weight of 0 or a mass ratio without intermediate axis shows a static T.', MIN_WEIGHT, MAX_WEIGHT),
            CREATE.createFloatField('weightBarB', 'Weight Bar End B', 'Weight of the second bar end. A weight of 0 or a mass ratio without intermediate axis shows a static T.', MIN_WEIGHT, MAX_WEIGHT),
            CREATE.createFloatField('weightStem', 'Weight Stem End', 'Weight of the stem end. A weight of 0 or a mass ratio without intermediate axis shows a static T.', MIN_WEIGHT, MAX_WEIGHT),
        ],
    );

    public transitionToStateAt(t: number): void {
        if (this._spin === null) return;
        this.update(this._spin.rotationAt(t));
        this.updateStreaks(this._spin, t);
    }

    private build(): void {
        const { weightBarA, weightBarB, weightStem } = this.config.data;

        // Natural frame: T lying on its side, bar vertical (y), stem horizontal (z), x points into the screen
        const barA: Vector3 = { x: 0, y: BAR_HALF_LENGTH, z: 0 };
        const barB: Vector3 = { x: 0, y: -BAR_HALF_LENGTH, z: 0 };
        const junction: Vector3 = Vector3.origin();
        const stemEnd: Vector3 = { x: 0, y: 0, z: STEM_LENGTH };

        // Only the three circles carry mass, the paths are massless
        const masses: PointMass[] = [
            { position: barA, mass: weightBarA },
            { position: barB, mass: weightBarB },
            { position: stemEnd, mass: weightStem },
        ];
        const body = analyseBody(masses);

        // The centre of mass is pinned to the origin, the T rotates around it
        const toCentre = (p: Vector3): Vector3 => Vector3.add(p, Vector3.scalarMultiply(-1, body.centre));
        this._restPoints = [barA, barB, junction, stemEnd].map(toCentre);
        this._streakSources = [barA, barB, stemEnd].map(toCentre);

        this._circleBarA = new Circle3d(Vector3.origin(), this.circleRadius(weightBarA), this._circleStyle, weightBarA > 0);
        this._circleBarB = new Circle3d(Vector3.origin(), this.circleRadius(weightBarB), this._circleStyle, weightBarB > 0);
        this._circleStem = new Circle3d(Vector3.origin(), this.circleRadius(weightStem), this._circleStyle, weightStem > 0);
        this._pathBar = new Path3d([], false, false, this._pathStyle);
        this._pathStem = new Path3d([], false, false, this._pathStyle);

        // Streaks are created once (hidden) and only updated per tick, drawn before the T
        this._streakPaths = this._streakSources.map(() => this.createStreakPaths());
        this.paths = [...this._streakPaths.flat(), this._pathBar, this._pathStem];
        this.circles = [this._circleBarA, this._circleBarB, this._circleStem];

        if (hasIntermediateAxis(body.moments, MIN_RELATIVE_MOMENT_GAP)) {
            this._spin = new RigidBodySpin(body.moments, body.axes, SPIN_PER_TICK, PERTURBATION, SUBSTEPS_PER_TICK);
        } else {
            console.warn(`DzhanibekovEffect: the principal moments of inertia [${body.moments.join(', ')}] have no clearly intermediate axis (weights 0 or a special mass ratio), so the T is shown without motion.`);
        }

        this.update(identityMatrix());
    }

    /** Equal density for all weights: volume ~ weight, so radius ~ cube root of weight. */
    private circleRadius(weight: number): number {
        return CIRCLE_RADIUS_AT_REFERENCE * Math.cbrt(weight / REFERENCE_WEIGHT);
    }

    /** Applies the rotation (start orientation -> current orientation) to the T and writes it to the shapes. */
    private update(rotation: Matrix3): void {
        const [barA, barB, junction, stemEnd] = this._restPoints.map((p) => applyMatrix(rotation, p));

        this._circleBarA.position = barA;
        this._circleBarB.position = barB;
        this._circleStem.position = stemEnd;
        this._pathBar.path = clipLine3DByFactor(barA, barB, .9, .9);
        this._pathStem.path = clipLine3DByFactor(junction, stemEnd, .8, .9);
    }

    private createStreakPaths(): Path3d[] {
        const paths: Path3d[] = [];
        for (let i = 0; i < STREAK_CHUNK_COUNT; i++) {
            const fade = Math.max(0, 1 - STREAK_FADE_STEP * i);
            paths.push(new Path3d([Vector3.origin(), Vector3.origin()], false, false, this.createStreakStyle(fade), false));
        }
        return paths;
    }

    /** Writes the history of the three weights (the last STREAK_POINT_COUNT ticks, newest first) to the streak paths. */
    private updateStreaks(spin: RigidBodySpin, t: number): void {
        // Rotations of the past ticks come straight from the spin cache, null before t = 0
        const rotations: (Matrix3 | null)[] = [];
        for (let k = 0; k < STREAK_POINT_COUNT; k++) {
            rotations.push(t - k >= 0 ? spin.rotationAt(t - k) : null);
        }

        this._streakSources.forEach((source: Vector3, index: number) => {
            const points: StreakPoint[] = rotations.map((rotation: Matrix3 | null) => (
                rotation === null
                    ? { point: Vector3.origin(), valid: false }
                    : { point: applyMatrix(rotation, source), valid: true }
            ));
            this.pointsToPaths(points).forEach((chunk: StreakPath, chunkIndex: number) => {
                const streakPath = this._streakPaths[index][chunkIndex];
                if (streakPath === undefined) return;
                streakPath.path = chunk.path;
                streakPath.visible = chunk.visible;
            });
        });
    }

    private pointsToPaths(points: StreakPoint[]): StreakPath[] {
        const result: StreakPath[] = [];
        for (let i = STREAK_FIRST_POINT; i < points.length; i += STREAK_CHUNK_SIZE) {
            const chunk = points.slice(i, i + STREAK_CHUNK_SIZE);
            if (chunk.some((point: StreakPoint) => !point.valid)) {
                result.push({ path: [Vector3.origin(), { x: 1, y: 0, z: 0 }], visible: false });
            } else {
                result.push({ path: chunk.map((point: StreakPoint) => point.point), visible: true });
            }
        }
        return result;
    }

    private createStreakStyle(fadeFactor: number): PathStyle {
        return pathStyle()
            .strokeWidth(STREAK_WIDTH * fadeFactor)
            .stroke(STREAK_COLOUR)
            .strokeOpacity(fadeFactor)
            .get();
    }
}