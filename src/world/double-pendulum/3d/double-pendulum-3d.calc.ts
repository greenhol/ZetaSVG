export interface Pendulum3dParameters {
    l1: number;
    l2: number;
    m1: number;
    m2: number;
    g: number;
}

export interface PendulumState {
    theta1: number;
    phi1: number;
    theta2: number;
    phi2: number;
    dtheta1: number;
    dphi1: number;
    dtheta2: number;
    dphi2: number;
}

export interface StateDerivatives {
    dtheta1: number;
    dphi1: number;
    dtheta2: number;
    dphi2: number;
    ddtheta1: number;
    ddphi1: number;
    ddtheta2: number;
    ddphi2: number;
}

export abstract class DoublePendulum3DCalc {
    public _params: Pendulum3dParameters;
    public _timeStep: number;

    constructor(params: Pendulum3dParameters, timeStep: number) {
        this._params = params;
        this._timeStep = timeStep;
    }

    /** Main simulation update method - advances the physics simulation by one time step */
    public abstract updateState(state: PendulumState): PendulumState | null;

    /** Calculate total energy of the system (for conservation checking) */
    public abstract getTotalEnergy(state: PendulumState): number;
}
