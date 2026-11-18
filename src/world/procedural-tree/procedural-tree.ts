import { ModuleConfig } from '../../../shared/config';
import { InitializeAfterConstruct } from '../../../shared/initializable';
import { XoRng } from '../../../shared/xo-rng';
import { ONE_DEGREE } from '../../types/constants';
import { Circle3d, circleStyle } from '../../types/shape/circle';
import { Path3d, pathStyle } from '../../types/shape/path';
import { Vector3 } from '../../types/vector-3';
import { CREATE } from '../ui/world-config-field-creator';
import { World, WorldConfig } from '../world';

// Geometry
const GROUND_Y = 0;                        // y of the ground level where all paths start
const GOLDEN_ANGLE = 137.508 * ONE_DEGREE; // angle step for sunflower packing of the paths inside a bundle
const PATH_SPACING = 0.05;                 // distance between two neighbouring paths inside a bundle
const BUNDLE_PACKING = 0.52;               // sunflower factor: bundle radius = PATH_SPACING * this * sqrt(path count)
const TRUNK_LENGTH = 1.5;                  // length of the first segment (trunk, before the first fork)
const BRANCH_LENGTH = 1.2;                 // length of the segment after the first fork
const LENGTH_DECAY = 0.8;                  // each following generation is this much shorter
const LENGTH_JITTER = 0.25;                // random +/- fraction applied to a segment length
const THREE_WAY_CHANCE = 0.3;              // probability that a fork has 3 children instead of 2
const TILT_MIN = 20 * ONE_DEGREE;          // minimum angle between a child and its parent direction
const TILT_MAX = 45 * ONE_DEGREE;          // maximum angle between a child and its parent direction
const AZIMUTH_JITTER = 15 * ONE_DEGREE;    // random +/- turn of a child around the parent direction
const UP_PULL = 0.15;                      // upward bias added to every child direction (0 = none, higher = more bush-like)

// Look
const BRANCH_WIDTH = 0.5;                  // path stroke width
const LEAF_RADIUS_MIN = 1.5;                 // smallest leaf radius (not in world units)
const LEAF_RADIUS_MAX = 3;                 // largest leaf radius (not in world units)
const LEAF_GAP = 0.12;                     // world-unit distance from the path end to the leaf centre

/** One path while the tree is built: its points so far and its offset from the centre line of the current bundle. */
interface Member {
    path: Vector3[];
    offset: Vector3;
}

interface ProceduralTreeConfig extends WorldConfig {
    leaves: number,
    seed: number | null,
}

@InitializeAfterConstruct()
export class ProceduralTree extends World {

    private _rng: XoRng;

    private _branchStyle = pathStyle()
        .strokeWidth(BRANCH_WIDTH)
        .stroke('#3e2510')
        .strokeLinecap('round')
        .strokeLinejoin('round')
        .get();

    private _leafStyle = circleStyle()
        .strokeWidth(0.3)
        .stroke('#83b127')
        .fill('#2a7d37')
        .get();

    constructor() {
        super();
        this._rng = new XoRng(this.config.data.seed);
        this.build();
    }

    override config = new ModuleConfig<ProceduralTreeConfig>(
        {
            cameraPerspective: {
                position: { x: 0, y: 4, z: -5 },
                angleX: 0 * ONE_DEGREE,
                angleY: 0 * ONE_DEGREE,
                angleZ: 0 * ONE_DEGREE,
                fov: 90,
                type: 'Orbit',
            },
            leaves: 100,
            seed: 42,
        },
        'proceduralTreeConfig',
        [
            CREATE.createIntegerField('leaves', 'Leaves', 'Number of Leaves', 1, 500),
            CREATE.createIntegerOptionalField('seed', 'Seed', 'Seed for RNG. If empty, RNG is simply unseeded', 0, 2147483637),
        ]
    );

    override backgroundColour: string = '#a3c4df';

    public transitionToStateAt(t: number): void {
        // Static scene, nothing to update.
    }

    private build(): void {
        // All paths start on the ground, packed in a disc (sunflower pattern), and rise together as one bundle.
        const up: Vector3 = { x: 0, y: 1, z: 0 };
        const base: Vector3 = { x: 0, y: GROUND_Y, z: 0 };
        const members: Member[] = [];
        for (let i = 0; i < this.config.data.leaves; i++) {
            const angle = i * GOLDEN_ANGLE;
            const radius = PATH_SPACING * BUNDLE_PACKING * Math.sqrt(i + 0.5);
            const offset: Vector3 = { x: radius * Math.cos(angle), y: 0, z: radius * Math.sin(angle) };
            members.push({ path: [Vector3.add(base, offset)], offset });
        }
        this.grow(base, up, members, 0);
    }

    /** Grows one segment of the centre line for a bundle of paths, then forks it or ends it with leaves. */
    private grow(start: Vector3, dir: Vector3, members: Member[], depth: number): void {
        const length = depth === 0
            ? TRUNK_LENGTH
            : BRANCH_LENGTH * Math.pow(LENGTH_DECAY, depth - 1) * this._rng.nextInRange(1 - LENGTH_JITTER, 1 + LENGTH_JITTER);
        const end = Vector3.add(start, Vector3.scalarMultiply(length, dir));
        members.forEach((m) => m.path.push(Vector3.add(end, m.offset)));

        if (members.length === 1) {
            this.addLeaf(members[0], dir);
        } else {
            this.fork(end, dir, members, depth);
        }
    }

    /** Splits a bundle into 2-3 sub-bundles that peel off to different sides. */
    private fork(end: Vector3, dir: Vector3, members: Member[], depth: number): void {
        const count = members.length;
        const childCount = Math.min(count, this._rng.next() < THREE_WAY_CHANCE ? 3 : 2);

        // Random number of paths per child, at least one each
        const sizes: number[] = new Array(childCount).fill(1);
        for (let i = childCount; i < count; i++) {
            sizes[Math.floor(this._rng.next() * childCount)]++;
        }

        // Pick a random split axis across the bundle. Sorting the paths along it and handing out
        // consecutive chunks means each child gets the paths on its own side, so they don't cross.
        const [u, w] = this.basis(dir);
        const theta = this._rng.next() * 2 * Math.PI;
        const axis = this.planar(u, w, theta);
        const mirror = this._rng.next() < 0.5 ? 1 : -1;
        const sorted = [...members].sort((a, b) => this.dot(a.offset, axis) - this.dot(b.offset, axis));

        let from = 0;
        sizes.forEach((size, k) => {
            const group = sorted.slice(from, from + size);
            from += size;

            // Child k points to the side of the axis that matches its chunk (first chunk: -axis, last chunk: +axis)
            const sigma = mirror * Math.PI * (1 - k / (childCount - 1)) + this._rng.nextInRange(-AZIMUTH_JITTER, AZIMUTH_JITTER);
            const lateral = this.planar(u, w, theta + sigma);
            const tilt = this._rng.nextInRange(TILT_MIN, TILT_MAX);
            const childDir = this.normalize(Vector3.add(
                Vector3.add(Vector3.scalarMultiply(Math.cos(tilt), dir), Vector3.scalarMultiply(Math.sin(tilt), lateral)),
                { x: 0, y: UP_PULL, z: 0 },
            ));

            // Re-centre the chunk on the child's centre line, move it to the edge of the parent bundle
            // on the child's side, and rotate it into the plane perpendicular to the child direction.
            const centroid = Vector3.scalarMultiply(1 / size, group.reduce((sum, m) => Vector3.add(sum, m.offset), Vector3.origin()));
            const shift = Vector3.scalarMultiply(Math.max(0, this.bundleRadius(count) - this.bundleRadius(size)), lateral);
            group.forEach((m) => {
                const moved = Vector3.add(Vector3.add(m.offset, Vector3.scalarMultiply(-1, centroid)), shift);
                m.offset = this.rotate(moved, dir, childDir);
            });

            this.grow(end, childDir, group, depth + 1);
        });
    }

    /** Finishes a path and puts its leaf slightly beyond the path end, in the direction of the last segment. */
    private addLeaf(member: Member, dir: Vector3): void {
        const tip = member.path[member.path.length - 1];
        const radius = this._rng.nextInRange(LEAF_RADIUS_MIN, LEAF_RADIUS_MAX);
        this.paths.push(new Path3d(member.path, false, false, this._branchStyle));
        this.circles.push(new Circle3d(Vector3.add(tip, Vector3.scalarMultiply(LEAF_GAP, dir)), radius, this._leafStyle));
    }

    private bundleRadius(pathCount: number): number {
        return PATH_SPACING * BUNDLE_PACKING * Math.sqrt(pathCount);
    }

    /** Two unit vectors that are perpendicular to d and to each other. */
    private basis(d: Vector3): [Vector3, Vector3] {
        const helper: Vector3 = Math.abs(d.z) < 0.9 ? { x: 0, y: 0, z: 1 } : { x: 1, y: 0, z: 0 };
        const u = this.normalize(this.cross(d, helper));
        return [u, this.cross(d, u)];
    }

    /** Unit vector in the plane spanned by u and w, at the given angle from u. */
    private planar(u: Vector3, w: Vector3, angle: number): Vector3 {
        return Vector3.add(Vector3.scalarMultiply(Math.cos(angle), u), Vector3.scalarMultiply(Math.sin(angle), w));
    }

    /** Rotates v by the rotation that turns direction `from` into direction `to` (Rodrigues' formula). */
    private rotate(v: Vector3, from: Vector3, to: Vector3): Vector3 {
        const cross = this.cross(from, to);
        const sin = Vector3.abs(cross);
        if (sin < 1e-9) return v;
        const k = Vector3.scalarMultiply(1 / sin, cross);
        const cos = this.dot(from, to);
        return Vector3.add(
            Vector3.add(Vector3.scalarMultiply(cos, v), Vector3.scalarMultiply(sin, this.cross(k, v))),
            Vector3.scalarMultiply(this.dot(k, v) * (1 - cos), k),
        );
    }

    private dot(a: Vector3, b: Vector3): number {
        return a.x * b.x + a.y * b.y + a.z * b.z;
    }

    private cross(a: Vector3, b: Vector3): Vector3 {
        return { x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x };
    }

    private normalize(v: Vector3): Vector3 {
        return Vector3.scalarMultiply(1 / Vector3.abs(v), v);
    }
}
