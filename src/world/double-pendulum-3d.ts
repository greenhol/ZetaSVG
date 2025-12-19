import { ModuleConfig } from '../config/module-config';
import { ONE_DEGREE } from '../types/constants';
import { Perspective } from '../types/perspective';
import { Circle3d, circleStyle } from '../types/shape/circle';
import { Group3d } from '../types/shape/group';
import { Path3d, PathStyle, pathStyle } from '../types/shape/path';
import { createOrigin, Vector3 } from '../types/vector-3';
import { clipLine3D } from '../utils/clip-line-3d';
import { RingBufferSimple } from '../utils/ring-buffer-simple';
import { DoublePendulum3DCalc, Pendulum3dParameters, PendulumState } from './double-pendulum-3d.calc';
import { DoublePendulum3DCalcGofen } from './double-pendulum-3d.calc-gofen';
import { World, WorldConfig } from './world';

interface StreakPoint {
    point: Vector3,
    valid: boolean,
}

interface StreakPath {
    path: Vector3[],
    visible: boolean,
}

interface DoublePendulum3dConfig extends WorldConfig {
    cameraPerspective: Perspective;
    parameters: Pendulum3dParameters;
    initialState: PendulumState;
};

export class DoublePendulum3d extends World {

    private _current: PendulumState;
    private _streakLength: number = 120;
    private _streakOffset: number = 4;
    private _streakChunkSize: number = 12;
    private _streakChunkGradientStep: number = this._streakChunkSize / this._streakLength;
    private _streak1: RingBufferSimple<StreakPoint> = new RingBufferSimple(this._streakLength + this._streakOffset, { point: createOrigin(), valid: false });
    private _streak2: RingBufferSimple<StreakPoint> = new RingBufferSimple(this._streakLength + this._streakOffset, { point: createOrigin(), valid: false });

    /** For Experimentation in the future - claculating initially */
    // private _data: PendulumState[];
    private _calculator: DoublePendulum3DCalc;

    private _running: boolean = true;

    private _pathStyleCs = pathStyle()
        .strokeWidth(0.5)
        .stroke('#000')
        .strokeOpacity(.5)
        .get();

    private _circleStyle = circleStyle()
        .strokeWidth(1.5)
        .stroke('#f80')
        .fill('#fff')
        .get();

    private _pathStyle = pathStyle()
        .strokeWidth(2)
        .stroke('#88a')
        .strokeLinecap('round')
        .get();

    readonly _csPaths: Path3d[];
    readonly _g: Group3d;

    constructor() {
        super()

        const csSize = 1.5;
        this._csPaths = [
            new Path3d([
                { x: -csSize, y: 0, z: 0 },
                { x: csSize, y: 0, z: 0 },
            ], false, true, this._pathStyleCs),
            new Path3d([
                { x: 0, y: -csSize * 2, z: 0 },
                { x: 0, y: csSize, z: 0 },
            ], false, true, this._pathStyleCs),
            new Path3d([
                { x: 0, y: 0, z: -csSize },
                { x: 0, y: 0, z: csSize },
            ], false, true, this._pathStyleCs),
        ];
        this._g = new Group3d(createOrigin(), []);

        this._current = structuredClone(this.config.data.initialState);
        this._calculator = new DoublePendulum3DCalcGofen(this.config.data.parameters, 0.001);

        /** For Experimentation in the future - claculating initially */
        // this._data = [structuredClone(initialState)];
        // const time1 = Date.now();
        // this.calculatePendulumData(20000, initialState);
        // const time2 = Date.now();
        // const diff = time2 - time1;
        // console.log(`# Calculation done with size ${this._data.length} took ${diff}ms`);

        this.paths = this._csPaths;
        this.groups = [this._g];

        this.updateWithCurrent();

        this.init();
    }

    override config = new ModuleConfig<DoublePendulum3dConfig>(
        {
            cameraPerspective: {
                position: { x: 0, y: -0.8, z: -2 },
                angleX: 40 * ONE_DEGREE,
                angleY: -30 * ONE_DEGREE,
                angleZ: 0 * ONE_DEGREE,
            },
            parameters: {
                m1: 1,
                m2: 1,
                l1: 1,
                l2: 1,
                g: 9.81,
            },
            initialState: {
                theta1: 1,
                phi1: 0,
                theta2: 1,
                phi2: 0,
                dtheta1: 1,
                dphi1: 2.460115 / 2,
                dtheta2: 0,
                dphi2: 2.460115,
            },
        },
        "doublePendulum3dConfig",
    );

    public name: string = "Double Pendulum 3D";

    public transitionToStateAt(t: number): void {
        if (!this._running) {
            return;
        }

        /** For Experimentation in the future - claculating initially */
        // const dt = 0.025;
        // const time = dt * t;
        // t *= 20;
        // if (t <= this._data.length) {
        //     this._current[0] = this._data[t - 1];
        //     this.updateWithCurrent();
        // }

        const steps = 20;
        let current: PendulumState = structuredClone(this._current);
        let candidate: PendulumState | null = structuredClone(this._current);
        let next: PendulumState = structuredClone(this._current);
        for (let i = 0; i < steps; i++) {
            current = structuredClone(next);
            candidate = this._calculator.updateState(current);
            if (candidate == null) {
                console.error(`#transitionToStateAt - Problem at t=${t}, aborting`);
                this._running = false;
                return;
            } else {
                next = candidate;
            }
        }
        this._current = next;
        this.updateWithCurrent();
    }

    private updateWithCurrent() {
        const coords = this.toCartesian(this._current.theta1, this._current.phi1, this._current.theta2, this._current.phi2);
        const newCoords: Vector3[] = [
            createOrigin(),
            { x: coords[0], y: coords[1], z: coords[2] },
            { x: coords[3], y: coords[4], z: coords[5] },
        ];
        const lineCoords1 = clipLine3D(newCoords[0], newCoords[1], 20);
        const lineCoords2 = clipLine3D(newCoords[1], newCoords[2], 20);

        const streakPaths1 = this.pointsToPaths(this._streak1.push({ point: newCoords[1], valid: true }), this._streakChunkSize);
        const streakPaths2 = this.pointsToPaths(this._streak2.push({ point: newCoords[2], valid: true }), this._streakChunkSize);

        this._g.children = [
            new Path3d(lineCoords1, false, false, this._pathStyle),
            new Path3d(lineCoords2, false, false, this._pathStyle),
            new Circle3d(newCoords[0], 3, this._circleStyle),
            new Circle3d(newCoords[1], 3 * Math.cbrt(this.config.data.parameters.m1), this._circleStyle),
            new Circle3d(newCoords[2], 3 * Math.cbrt(this.config.data.parameters.m2), this._circleStyle),
            ...streakPaths1.map((streak: StreakPath, index: number) => new Path3d(streak.path, false, false, this.createStreakStyle(1 - this._streakChunkGradientStep * index), streak.visible)),
            ...streakPaths2.map((streak: StreakPath, index: number) => new Path3d(streak.path, false, false, this.createStreakStyle(1 - this._streakChunkGradientStep * index), streak.visible)),
        ];
    }

    private pointsToPaths(points: StreakPoint[], chunkSize: number): StreakPath[] {
        const result: StreakPath[] = [];
        for (let i = this._streakOffset - 1; i < points.length; i += chunkSize) {
            const chunk = points.slice(i, i + chunkSize);
            if (chunk.some((point: StreakPoint) => !(point.valid))) {
                result.push({ path: [{ x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }], visible: false });
            } else {
                result.push({ path: chunk.map((point: StreakPoint) => point.point), visible: true });
            }
        }
        return result;
    }

    private createStreakStyle(fadeFactor: number): PathStyle {
        return pathStyle()
            .strokeWidth(.6 * fadeFactor)
            .stroke('#797')
            .strokeOpacity(fadeFactor)
            // .strokeLinecap('round')
            .get()
    }

    private toCartesian(theta1: number, phi1: number, theta2: number, phi2: number): [number, number, number, number, number, number] {
        // Arm1
        const x1 = this.config.data.parameters.l1 * Math.sin(theta1) * Math.cos(phi1);
        const y1 = -this.config.data.parameters.l1 * Math.cos(theta1);
        const z1 = this.config.data.parameters.l1 * Math.sin(theta1) * Math.sin(phi1);
        // Arm2
        const x2 = x1 + this.config.data.parameters.l2 * Math.sin(theta2) * Math.cos(phi2);
        const y2 = y1 - this.config.data.parameters.l2 * Math.cos(theta2);
        const z2 = z1 + this.config.data.parameters.l2 * Math.sin(theta2) * Math.sin(phi2);

        return [x1, y1, z1, x2, y2, z2];
    }

    /** For Experimentation in the future - claculating initially */
    // private calculatePendulumData(steps: number, initialState: PendulumState) {
    //     let state: PendulumState = structuredClone(initialState);
    //     let energy: number[] = [];

    //     for (let i = 0; i < steps; i++) {
    //         const newState = this._calculator.updateState(state);
    //         if (newState == null) {
    //             console.error(`Calculation aborted due to error at step ${i}`);
    //             break;
    //         }
    //         energy.push(this._calculator.getTotalEnergy(newState));
    //         this._data.push(structuredClone(newState));
    //         state = newState;
    //     }
    //     // console.log("ENERGY", energy);
    //     console.log("ENERGY CHUNKS", this.chunkMean(energy, 100));
    // }

    // private chunkMean(values: number[], chunkSize: number): number[] {
    //     const result: number[] = [];
    //     for (let i = 0; i < values.length; i += chunkSize) {
    //         const chunk = values.slice(i, i + chunkSize);
    //         const mean = chunk.reduce((sum, val) => sum + val, 0) / chunk.length;
    //         result.push(mean);
    //     }
    //     return result;
    // }
}
