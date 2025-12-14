import { ModuleConfig } from '../config/module-config';
import { ONE_DEGREE } from '../types/constants';
import { Perspective } from '../types/perspective';
import { Circle3d, CircleStyle } from '../types/shape/circle';
import { Path3d, PathStyle } from '../types/shape/path';
import { Vector3 } from '../types/vector-3';
import { World, WorldConfig } from './world';

interface Pendulum2dParameters {
    l1: number;  // Length of first pendulum
    l2: number;  // Length of second pendulum
    m1: number;  // Mass of first pendulum
    m2: number;  // Mass of second pendulum
    g: number;   // Gravitational acceleration
    friction: number; // friction of the system
}

interface DoublePendulum2dConfig extends WorldConfig {
    cameraPerspective: Perspective;
    parameters: Pendulum2dParameters;
};

interface PendulumState {
    theta1: number;
    theta2: number;
    omega1: number;
    omega2: number;
}

export class DoublePendulum2d extends World {

    private _zDistance = 5;
    private _current: PendulumState[] = [];
    private _origins: Vector3[] = [];

    private _circleStyle: CircleStyle = {
        strokeWidth: 1.5,
        stroke: '#f80',
        strokeOpacity: 1,
        fill: '#fff',
        fillOpacity: 1,
    };

    private _pathStyle: PathStyle = {
        strokeWidth: 2,
        stroke: '#88a',
        strokeOpacity: 1,
    }

    constructor() {
        super()

        for (let x = -17; x < 18; x += 4) {
            for (let y = -9; y < 10; y += 4) {
                for (let z = 1; z < 2; z++) {
                    this._origins.push(
                        { x: x, y: y, z: z * this._zDistance }
                    )
                    this._current.push({
                        theta1: x / Math.PI / 2,
                        theta2: y / Math.PI / 2,
                        omega1: (z - 1) * 1,
                        omega2: -(z - 1) * 1,
                    });
                }
            }
        }

        this.updateWithCurrent();

        this.init();
    }

    override config = new ModuleConfig<DoublePendulum2dConfig>(
        {
            cameraPerspective: {
                position: { x: 0, y: -2, z: -6 },
                angleX: 0 * ONE_DEGREE,
                angleY: 0 * ONE_DEGREE,
                angleZ: 0 * ONE_DEGREE,
            },
            parameters: {
                m1: 1,
                m2: 1,
                l1: 1,
                l2: 1,
                g: 9.81,
                friction: 1,
            }
        },
        "doublePendulum2dConfig",
    );

    public name: string = "Double Pendulum 2D";

    public transitionToStateAt(t: number): void {
        const dt = 0.025;

        this._current = this._current.map((state: PendulumState): PendulumState => {
            const nextStep = this.rungeKutta4Step(this.doublePendulumODE, this.pendulumStateAsArray(state), dt, this.config.data);
            nextStep[2] *= this.config.data.parameters.friction;
            nextStep[3] *= this.config.data.parameters.friction;
            return this.pendulumStateFromArray(nextStep);
        });
        this.updateWithCurrent();
    }

    private updateWithCurrent() {
        const newCoords = this._current.map((state: PendulumState, index: number): Vector3[] => {
            const coords = this.toCartesian(state.theta1, state.theta2);
            const coord1: Vector3 = { x: this._origins[index].x, y: this._origins[index].y, z: this._origins[index].z };
            const coord2: Vector3 = { x: this._origins[index].x + coords[0], y: this._origins[index].y + coords[1], z: this._origins[index].z };
            const coord3: Vector3 = { x: this._origins[index].x + coords[2], y: this._origins[index].y + coords[3], z: this._origins[index].z };
            return [coord1, coord2, coord3];
        });

        this.paths = newCoords.map((spaceCoords: Vector3[]): Path3d => { return new Path3d(spaceCoords, false, false, this._pathStyle) });

        this.circles = newCoords.map((coord: Vector3[]): Circle3d[] => {
            return [
                new Circle3d(coord[0], 3, this._circleStyle),
                new Circle3d(coord[1], 3 * Math.cbrt(this.config.data.parameters.m1), this._circleStyle),
                new Circle3d(coord[2], 3 * Math.cbrt(this.config.data.parameters.m2), this._circleStyle),
            ]
        }).flat();
    }

    private toCartesian(theta1: number, theta2: number): [number, number, number, number] {
        const x1 = this.config.data.parameters.l1 * Math.sin(theta1);
        const y1 = -this.config.data.parameters.l1 * Math.cos(theta1);
        const x2 = x1 + this.config.data.parameters.l2 * Math.sin(theta2);
        const y2 = y1 - this.config.data.parameters.l2 * Math.cos(theta2);

        return [x1, y1, x2, y2];
    }

    private pendulumStateAsArray(state: PendulumState): number[] {
        return [state.theta1, state.theta2, state.omega1, state.omega2];
    }

    private pendulumStateFromArray(array: number[]): PendulumState {
        return { theta1: array[0], theta2: array[1], omega1: array[2], omega2: array[3] };
    }

    private doublePendulumODE(y: number[], config: DoublePendulum2dConfig): number[] {
        const p = config.parameters;
        const theta1 = y[0];
        const theta2 = y[1];
        const omega1 = y[2];
        const omega2 = y[3];

        // Intermediate terms
        const deltaTheta = theta2 - theta1;
        const sinDeltaTheta = Math.sin(deltaTheta);
        const cosDeltaTheta = Math.cos(deltaTheta);

        const dOmega1dt =
            (p.m2 * p.l1 * omega1 ** 2 * sinDeltaTheta * cosDeltaTheta +
                p.m2 * p.g * Math.sin(theta2) * cosDeltaTheta +
                p.m2 * p.l2 * omega2 ** 2 * sinDeltaTheta -
                (p.m1 + p.m2) * p.g * Math.sin(theta1)) /
            (p.l1 * ((p.m1 + p.m2) - p.m2 * cosDeltaTheta ** 2));

        const dOmega2dt =
            (-p.m2 * p.l2 * omega2 ** 2 * sinDeltaTheta * cosDeltaTheta +
                (p.m1 + p.m2) * (p.g * Math.sin(theta1) * cosDeltaTheta - p.l1 * omega1 ** 2 * sinDeltaTheta) -
                (p.m1 + p.m2) * p.g * Math.sin(theta2)) /
            (p.l2 * ((p.m1 + p.m2) - p.m2 * cosDeltaTheta ** 2));

        return [omega1, omega2, dOmega1dt, dOmega2dt];
    }

    private rungeKutta4Step(
        f: (y: number[], c: DoublePendulum2dConfig) => number[],
        y: number[],
        dt: number,
        c: DoublePendulum2dConfig,
    ): number[] {
        const k1 = f(y, c);
        const k2 = f(y.map((yi, i) => yi + (dt / 2) * k1[i]), c);
        const k3 = f(y.map((yi, i) => yi + (dt / 2) * k2[i]), c);
        const k4 = f(y.map((yi, i) => yi + dt * k3[i]), c);

        return y.map((yi, i) => yi + (dt / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));;
    }
}
