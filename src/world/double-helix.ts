import { ModuleConfig } from '../../shared/config';
import { InitializeAfterConstruct } from '../../shared/initializable';
import { ONE_DEGREE } from '../types/constants';
import { Circle3d, circleStyle } from '../types/shape/circle';
import { Path3d, pathStyle } from '../types/shape/path';
import { Vector3 } from '../types/vector-3';
import { CREATE } from './ui/world-config-field-creator';
import { World, WorldConfig } from './world';

interface DoubleHelixConfig extends WorldConfig {
    basePairs: number,
}

// Geometry
const RADIUS = 1.2;                         // helix radius
const RISE = 0.33;                          // vertical distance between two base pairs
const TWIST = 30 * ONE_DEGREE;              // rotation per base pair (12 pairs per full turn)
const STRAND_OFFSET = 150 * ONE_DEGREE;     // angle between strand A and B (180° = symmetric, 150° = major/minor groove like real DNA)

// Animation
const ROTATION_PER_TICK = -0.75 * ONE_DEGREE; // one tick = one animation frame -> ~12s per revolution at 60 fps

// Look
const BEAD_RADIUS = 5;                      // neighbouring beads are ~0.7 apart, so they almost touch and form the strand
const RUNG_GAP = 0.3;                       // free space between a bead and the start of its rung
const RUNG_MID_GAP = 0.1;                   // free space between the two rung halves, measured from the centre on each side
const RUNG_WIDTH = 2.5;

// Tilt of the helix's main axis around the z axis
const AXIS_TILT_INITIAL = -30 * ONE_DEGREE;
const AXIS_TILT_PER_TICK = -0.1 * ONE_DEGREE;

// Base pairs: [colour of the base on strand A, colour of the base on strand B]
const BASE_PAIR_COLOURS: [string, string][] = [
    ['#ff8800', '#2255ff'], // A - T
    ['#22cc66', '#ffdd00'], // G - C
    ['#2255ff', '#ff8800'], // T - A
    ['#ffdd00', '#22cc66'], // C - G
];

@InitializeAfterConstruct()
export class DoubleHelix extends World {

    private _beadsA: Circle3d[] = [];
    private _beadsB: Circle3d[] = [];
    private _rungHalvesA: Path3d[] = [];
    private _rungHalvesB: Path3d[] = [];

    private beadCircleStyleA = circleStyle()
        .strokeWidth(0.5)
        .stroke('#000')
        .fill('#498cc7')
        .fillOpacity(0.5)
        .get();

    private beadCircleStyleB = circleStyle()
        .strokeWidth(0.5)
        .stroke('#000')
        .fill('#aa49c7')
        .fillOpacity(0.5)
        .get();

    constructor() {
        super();
        this.build();
    }

    override config = new ModuleConfig<DoubleHelixConfig>(
        {
            cameraPerspective: {
                position: { x: -0, y: 0, z: -7 },
                angleX: 0 * ONE_DEGREE,
                angleY: 90 * ONE_DEGREE,
                angleZ: 0 * ONE_DEGREE,
                fov: 90,
                type: 'Orbit',
            },
            basePairs: 30,
        },
        'doubleHelixConfig',
        [
            CREATE.createIntegerField('basePairs', 'Base Pairs', 'Number of base pairs', 1, 200),
        ]
    );

    override backgroundColour: string = '#d2f0ff';

    public transitionToStateAt(t: number): void {
        this.update(t * ROTATION_PER_TICK, AXIS_TILT_INITIAL + t * AXIS_TILT_PER_TICK);
    }

    private build(): void {
        for (let i = 0; i < this.config.data.basePairs; i++) {
            const [colourA, colourB] = BASE_PAIR_COLOURS[i % BASE_PAIR_COLOURS.length];

            // Rung: two halves meeting in the middle, each coloured like its base
            const halfA = new Path3d([], false, false, this.rungStyle(colourA));
            const halfB = new Path3d([], false, false, this.rungStyle(colourB));
            this._rungHalvesA.push(halfA);
            this._rungHalvesB.push(halfB);
            this.paths.push(halfA, halfB);

            // Beads: together they form the two strands
            const beadA = new Circle3d(
                { x: 0, y: 0, z: 0 },
                BEAD_RADIUS,
                this.beadCircleStyleA,
            );
            const beadB = new Circle3d(
                { x: 0, y: 0, z: 0 },
                BEAD_RADIUS,
                this.beadCircleStyleB,
            );
            this._beadsA.push(beadA);
            this._beadsB.push(beadB);
            this.circles.push(beadA, beadB);
        }

        this.update(0, AXIS_TILT_INITIAL);
    }

    private rungStyle(colour: string) {
        return pathStyle()
            .strokeWidth(RUNG_WIDTH)
            .stroke(colour)
            .strokeLinecap('round')
            .strokeOpacity(0.75)
            .get();
    }

    private update(rotation: number, tilt: number): void {
        // const AXIS_TILT_IN_VIEW = -30 * ONE_DEGREE;
        const axisTiltSin = Math.sin(tilt);
        const axisTiltCos = Math.cos(tilt);

        for (let i = 0; i < this.config.data.basePairs; i++) {
            const y = this.yAt(i);
            const angle = i * TWIST + rotation;

            const a = this.point(angle, y);
            const b = this.point(angle + STRAND_OFFSET, y);

            // Unit direction from bead A to bead B (the rung lies in a horizontal plane)
            const dx = b.x - a.x;
            const dz = b.z - a.z;
            const length = Math.hypot(dx, dz);
            const ux = dx / length;
            const uz = dz / length;

            const centre: Vector3 = {
                x: (a.x + b.x) / 2,
                y,
                z: (a.z + b.z) / 2,
            };

            // Inner ends of the two halves, pulled back from the centre
            const midA: Vector3 = { x: centre.x - ux * RUNG_MID_GAP, y, z: centre.z - uz * RUNG_MID_GAP };
            const midB: Vector3 = { x: centre.x + ux * RUNG_MID_GAP, y, z: centre.z + uz * RUNG_MID_GAP };

            // Outer ends, pulled back from the beads
            const start: Vector3 = { x: a.x + ux * RUNG_GAP, y, z: a.z + uz * RUNG_GAP };
            const end: Vector3 = { x: b.x - ux * RUNG_GAP, y, z: b.z - uz * RUNG_GAP };

            this._beadsA[i].position = this.tilt(a, axisTiltSin, axisTiltCos);
            this._beadsB[i].position = this.tilt(b, axisTiltSin, axisTiltCos);
            this._rungHalvesA[i].path = [this.tilt(start, axisTiltSin, axisTiltCos), this.tilt(midA, axisTiltSin, axisTiltCos)];
            this._rungHalvesB[i].path = [this.tilt(midB, axisTiltSin, axisTiltCos), this.tilt(end, axisTiltSin, axisTiltCos)];
        }
    }

    /** Vertical position of a base pair index, centred around y = 0. */
    private yAt(pairIndex: number): number {
        return (pairIndex - (this.config.data.basePairs - 1) / 2) * RISE;
    }

    private point(angle: number, y: number): Vector3 {
        return {
            x: RADIUS * Math.cos(angle),
            y,
            z: RADIUS * Math.sin(angle),
        };
    }

    /** Rotates a point in the y-z plane (around the world x axis). */
    private tilt(v: Vector3, axisTiltSin: number, axisTiltCos: number): Vector3 {
        return {
            x: v.x,
            y: v.y * axisTiltCos - v.z * axisTiltSin,
            z: v.y * axisTiltSin + v.z * axisTiltCos,
        };
    }
}