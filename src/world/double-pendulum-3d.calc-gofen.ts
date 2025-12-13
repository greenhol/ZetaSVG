import { DoublePendulum3DCalc, PendulumState, StateDerivatives } from './double-pendulum-3d.calc';

export class DoublePendulum3DCalcGofen extends DoublePendulum3DCalc {

    override updateState(state: PendulumState): PendulumState | null {
        return this.rungeKutta4Step(state, this._timeStep);
    }

    override getTotalEnergy(state: PendulumState): number {
        const m1 = this._params.m1;
        const m2 = this._params.m2;
        const l1 = this._params.l1;
        const l2 = this._params.l2;

        // Positions (y-coordinate)
        const y1 = -l1 * Math.cos(state.theta1);
        const y2 = y1 - l2 * Math.cos(state.theta2);

        // Velocities (as before)
        const vx1 = l1 * (Math.cos(state.theta1) * Math.cos(state.phi1) * state.dtheta1 - Math.sin(state.theta1) * Math.sin(state.phi1) * state.dphi1);
        const vy1 = l1 * (Math.sin(state.theta1) * state.dtheta1);
        const vz1 = l1 * (Math.cos(state.theta1) * Math.sin(state.phi1) * state.dtheta1 + Math.sin(state.theta1) * Math.cos(state.phi1) * state.dphi1);

        const vx2 = vx1 + l2 * (Math.cos(state.theta2) * Math.cos(state.phi2) * state.dtheta2 - Math.sin(state.theta2) * Math.sin(state.phi2) * state.dphi2);
        const vy2 = vy1 + l2 * (Math.sin(state.theta2) * state.dtheta2);
        const vz2 = vz1 + l2 * (Math.cos(state.theta2) * Math.sin(state.phi2) * state.dtheta2 + Math.sin(state.theta2) * Math.cos(state.phi2) * state.dphi2);

        // Kinetic energy
        const ke1 = 0.5 * m1 * (vx1 * vx1 + vy1 * vy1 + vz1 * vz1);
        const ke2 = 0.5 * m2 * (vx2 * vx2 + vy2 * vy2 + vz2 * vz2);
        const KE = ke1 + ke2;

        // Potential energy (corrected)
        const PE = m1 * this._params.g * (y1 + l1) + m2 * this._params.g * (y2 + l1 + l2);

        // Total energy
        return KE + PE;
    }

    private rungeKutta4Step(state: PendulumState, dt: number): PendulumState | null {
        // k1 = f(t, y)
        const k1 = this.doublePendulumODE(state);
        if (k1 == null) { return null }

        // k2 = f(t + dt/2, y + k1*dt/2)
        const state2 = this.addScaledDerivatives(state, k1, dt / 2);
        const k2 = this.doublePendulumODE(state2);
        if (k2 == null) { return null }

        // k3 = f(t + dt/2, y + k2*dt/2)
        const state3 = this.addScaledDerivatives(state, k2, dt / 2);
        const k3 = this.doublePendulumODE(state3);
        if (k3 == null) { return null }

        // k4 = f(t + dt, y + k3*dt)
        const state4 = this.addScaledDerivatives(state, k3, dt);
        const k4 = this.doublePendulumODE(state4);
        if (k4 == null) { return null }

        // y_new = y + (k1 + 2*k2 + 2*k3 + k4) * dt/6
        return {
            theta1: state.theta1 + (k1.dtheta1 + 2 * k2.dtheta1 + 2 * k3.dtheta1 + k4.dtheta1) * dt / 6,
            phi1: state.phi1 + (k1.dphi1 + 2 * k2.dphi1 + 2 * k3.dphi1 + k4.dphi1) * dt / 6,
            theta2: state.theta2 + (k1.dtheta2 + 2 * k2.dtheta2 + 2 * k3.dtheta2 + k4.dtheta2) * dt / 6,
            phi2: state.phi2 + (k1.dphi2 + 2 * k2.dphi2 + 2 * k3.dphi2 + k4.dphi2) * dt / 6,
            dtheta1: state.dtheta1 + (k1.ddtheta1 + 2 * k2.ddtheta1 + 2 * k3.ddtheta1 + k4.ddtheta1) * dt / 6,
            dphi1: state.dphi1 + (k1.ddphi1 + 2 * k2.ddphi1 + 2 * k3.ddphi1 + k4.ddphi1) * dt / 6,
            dtheta2: state.dtheta2 + (k1.ddtheta2 + 2 * k2.ddtheta2 + 2 * k3.ddtheta2 + k4.ddtheta2) * dt / 6,
            dphi2: state.dphi2 + (k1.ddphi2 + 2 * k2.ddphi2 + 2 * k3.ddphi2 + k4.ddphi2) * dt / 6
        };
    }

    /** Helper function to add scaled derivatives to state for RK4 intermediate steps */
    private addScaledDerivatives(state: PendulumState, derivatives: StateDerivatives, scale: number): PendulumState {
        return {
            theta1: state.theta1 + derivatives.dtheta1 * scale,
            phi1: state.phi1 + derivatives.dphi1 * scale,
            theta2: state.theta2 + derivatives.dtheta2 * scale,
            phi2: state.phi2 + derivatives.dphi2 * scale,
            dtheta1: state.dtheta1 + derivatives.ddtheta1 * scale,
            dphi1: state.dphi1 + derivatives.ddphi1 * scale,
            dtheta2: state.dtheta2 + derivatives.ddtheta2 * scale,
            dphi2: state.dphi2 + derivatives.ddphi2 * scale
        };
    }

    private doublePendulumODE(state: PendulumState): StateDerivatives | null {
        const m1 = this._params.m1;
        const m2 = this._params.m2;
        const m = m1 + m2;
        const l1 = this._params.l1;
        const l2 = this._params.l2;
        const g = this._params.g;

        const theta1: number = state.theta1;
        const phi1: number = state.phi1;
        const theta2: number = state.theta2;
        const phi2: number = state.phi2;

        const dtheta1: number = state.dtheta1;
        const dphi1: number = state.dphi1;
        const dtheta2: number = state.dtheta2;
        const dphi2: number = state.dphi2;

        // Trigonometric functions
        const sinThe1: number = Math.sin(theta1);
        const sinThe2: number = Math.sin(theta2);
        const cosThe1: number = Math.cos(theta1);
        const cosThe2: number = Math.cos(theta2);

        const sinPhi1: number = Math.sin(phi1);
        const sinPhi2: number = Math.sin(phi2);
        const cosPhi1: number = Math.cos(phi1);
        const cosPhi2: number = Math.cos(phi2);

        // Combined angles
        const Phi2p1: number = phi2 + phi1;
        const Phi2m1: number = phi2 - phi1;

        const sinPhi2p1: number = Math.sin(Phi2p1);
        const cosPhi2p1: number = Math.cos(Phi2p1);
        const sinPhi2m1: number = Math.sin(Phi2m1);
        const sinPhi1m2: number = -sinPhi2m1;
        const cosPhi2m1: number = Math.cos(Phi2m1);

        // Double angle functions
        const sin2The1: number = Math.sin(2 * theta1);
        const sin2Phi1: number = Math.sin(2 * phi1);
        const sin2The2: number = Math.sin(2 * theta2);
        const cos2The2: number = Math.cos(2 * theta2);
        const cos2Phi2: number = Math.cos(2 * phi2);

        // Power functions
        const sin2Th1Th2: number = Math.pow(sinThe1 * sinThe2, 2);
        const cos2Th1Th2: number = Math.pow(cosThe1 * cosThe2, 2);
        const sinThe2up2: number = Math.pow(sinThe2, 2);
        const cosThe1up2: number = Math.pow(cosThe1, 2);
        const cosThe2up2: number = Math.pow(cosThe2, 2);
        const sinThe1up2: number = Math.pow(sinThe1, 2);
        const cosPhi2m1up2: number = Math.pow(cosPhi2m1, 2);

        // Derivatives squared
        const dThe1up2: number = Math.pow(dtheta1, 2);
        const dThe2up2: number = Math.pow(dtheta2, 2);
        const dPhi1up2: number = Math.pow(dphi1, 2);
        const dPhi2up2: number = Math.pow(dphi2, 2);

        // Combined derivatives
        const dPh22dTh22: number = dPhi2up2 + dThe2up2;
        const dPh12dTh12: number = dPhi1up2 + dThe1up2;

        // Power of cosines
        const cosThe1up3: number = Math.pow(cosThe1, 3);
        const cosThe2up3: number = Math.pow(cosThe2, 3);

        const kernel = -(m2 * sin2Th1Th2 * cosPhi2m1up2 + 0.5 * m2 * sin2The1 * sin2The2 * cosPhi2m1 + m2 * cos2Th1Th2 - m);
        const num1 = m2 * sinThe1 * sinThe2up2 * (l1 * cosThe1 * dThe1up2 + g) * cosPhi2m1up2 + (-l2 * cosThe1 * dPhi2up2 * cosThe2up2 + (l1 * (dPhi1up2 + 2 * dThe1up2) * cosThe1up2 + g * cosThe1 - l1 * dPh12dTh12) * cosThe2 + l2 * cosThe1 * dPh22dTh22) * m2 * sinThe2 * cosPhi2m1 - sinThe1 * (-l2 * m2 * dPhi2up2 * cosThe2up3 + m2 * l1 * cosThe1 * dPh12dTh12 * cosThe2up2 + l2 * m2 * dPh22dTh22 * cosThe2 + m * (-l1 * dPhi1up2 * cosThe1 + g));
        const num2 = -(-0.5 * sin2The2 * dThe2up2 * l2 * m2 * sinThe1up2 * cosPhi2m1up2 - sinThe1 * (-cosThe2 * dPhi1up2 * l1 * m * cosThe1up2 + (l2 * m2 * (dPhi2up2 + 2 * dThe2up2) * cosThe2up2 + g * m * cosThe2 - l2 * m2 * dPh22dTh22) * cosThe1 + cosThe2 * l1 * dPh12dTh12 * m) * cosPhi2m1 + (-dPhi1up2 * l1 * m * cosThe1up3 + (l2 * m2 * dPh22dTh22 * cosThe2 + g * m) * cosThe1up2 + l1 * dPh12dTh12 * m * cosThe1 - cosThe2 * dPhi2up2 * l2 * m) * sinThe2);
        const num3 = -(m2 * (sinThe1 * sinThe2up2 * (-l1 * dPhi1up2 * cosThe1up2 + g * cosThe1 + l1 * dPh12dTh12) * cosPhi2m1 + sinThe2 * (-l1 * cosThe2 * dPhi1up2 * cosThe1up3 + g * cosThe1up2 * cosThe2 + l1 * cosThe1 * cosThe2 * dPh12dTh12 - l2 * (cosThe2up2 * dPhi2up2 - dPh22dTh22))) * sinPhi1m2 - 2 * dtheta1 * l1 * (m2 * sin2Th1Th2 * cosPhi2m1up2 + 0.5 * m2 * sin2The1 * sin2The2 * cosPhi2m1 + m2 * cos2Th1Th2 - m) * dphi1 * cosThe1);
        const num4 = (-m2 * l2 * sinThe2 * (cosThe2up2 * dPhi2up2 - dPh22dTh22) * sinThe1up2 * cosPhi2m1 + sinThe1 * (-l1 * dPhi1up2 * m * cosThe1up2 + (-l2 * m2 * dPhi2up2 * cosThe2up3 + l2 * m2 * dPh22dTh22 * cosThe2 + g * m) * cosThe1 + l1 * dPh12dTh12 * m)) * sinPhi1m2 + 2 * cosThe2 * (m2 * sin2Th1Th2 * cosPhi2m1up2 + 0.5 * sin2The1 * sin2The2 * cosPhi2m1 * m2 + cos2Th1Th2 * m2 - m) * dtheta2 * dphi2 * l2;

        const ddtheta1 = num1 / (l1 * kernel);
        const ddtheta2 = num2 / (l2 * kernel);
        const ddphi1 = num3 / (l1 * kernel * sinThe1);
        const ddphi2 = num4 / (l2 * kernel * sinThe2);

        if (this.isInvalidNumber(ddtheta1) || this.isInvalidNumber(ddtheta2) || this.isInvalidNumber(ddphi1) || this.isInvalidNumber(ddphi2)) {
            return null;
        }

        return {
            dtheta1: dtheta1,
            dphi1: dphi1,
            dtheta2: dtheta2,
            dphi2: dphi2,
            ddtheta1: ddtheta1,
            ddphi1: ddphi1,
            ddtheta2: ddtheta2,
            ddphi2: ddphi2,
        }
    }

    private isInvalidNumber(value: number): boolean { return !isFinite(value) || isNaN(value) || value == null }
}
