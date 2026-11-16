import { Vector3 } from '../types/vector-3';

/** Settings of the simulation itself. Units are arbitrary "simulation units", not world units of the engine. */
export interface NBodyParameters {
    bodyCount: number;
    gravitationalConstant: number;  // G
    softening: number;              // softening length: caps the force at very close range, prevents numerical blow-ups
    timePerTick: number;            // simulated time per animation frame
    substepsPerTick: number;        // integration steps per frame, so dt = timePerTick / substepsPerTick
    streakSamples: number;          // stored history points per body (total streak length)
    streakSampleInterval: number;   // a history point is stored every n ticks
}

/** Settings for the random cluster generator. */
export interface NBodyClusterParameters {
    massMin: number;                // smallest possible mass
    massRatio: number;              // largest possible mass = massMin * massRatio
    spawnRadius: number;            // bodies start inside a sphere of this radius
    minSpawnDistance: number;       // minimum distance between two bodies at the start
    virialRatio: number;            // kinetic / |potential| energy. 0.5 = balanced, lower = more bound, higher = more escapes
    swirlStrength: number;          // share of common rotation in the initial velocities (0 = purely random directions)
    swirlAxis: Vector3;             // axis of that common rotation (is normalized in code)
}

/** Settings for the generator with a heavy central body ("sun") at index 0 and the planets at index 1 and up. */
export interface NBodySunClusterParameters {
    massMin: number;                // smallest possible planet mass
    massRatio: number;              // largest possible planet mass = massMin * massRatio
    sunMassFactor: number;          // mass of the central body = sunMassFactor * total mass of all planets
    orbitRadiusMin: number;         // planets start at least this far from the central body
    orbitRadiusMax: number;         // planets start at most this far from the central body
    minSpawnDistance: number;       // minimum distance between two planets at the start
    orbitAxis: Vector3;             // common axis the planets rotate around (is normalized in code)
    randomness: number;             // 0 = all planets start on circular orbits; up to about 0.4 every planet starts bound to the central body, above that some may escape
}

// Spawn positions are retried at most this often per body, so an impossible spacing cannot hang the page
const MAX_SPAWN_ATTEMPTS = 1000;

/**
 * Gravity calculation for N bodies, independent of any rendering.
 *
 * The result only depends on the tick: advanceTo(t) steps forward from the last calculated tick,
 * and restarts from the stored initial state if t is smaller than that.
 */
export class NBodyCalc {

    private readonly _parameters: NBodyParameters;
    private readonly _bodyCount: number;

    // Initial state (used to restart the simulation if time ever jumps backwards)
    private _mass: Float64Array;
    private _initialPosition: Float64Array;
    private _initialVelocity: Float64Array;

    // Current simulation state (x, y, z interleaved per body)
    private _position: Float64Array;
    private _velocity: Float64Array;
    private _acceleration: Float64Array;
    private _fixed: Uint8Array;                 // 1 = body keeps attracting others but never moves
    private _simTick: number;

    // Streak history: ring buffer per body, same fill level for all bodies
    private _trail: Float64Array;
    private _trailHead: number;                 // slot the next sample is written to
    private _trailCount: number;                // number of valid samples (max streakSamples)

    constructor(parameters: NBodyParameters) {
        this._parameters = parameters;
        this._bodyCount = parameters.bodyCount;

        this._mass = new Float64Array(this._bodyCount);
        this._initialPosition = new Float64Array(this._bodyCount * 3);
        this._initialVelocity = new Float64Array(this._bodyCount * 3);

        this._position = new Float64Array(this._bodyCount * 3);
        this._velocity = new Float64Array(this._bodyCount * 3);
        this._acceleration = new Float64Array(this._bodyCount * 3);
        this._fixed = new Uint8Array(this._bodyCount);
        this._simTick = 0;

        this._trail = new Float64Array(this._bodyCount * parameters.streakSamples * 3);
        this._trailHead = 0;
        this._trailCount = 0;
    }

    // ---------------------------------------------------------------- public interface

    public get bodyCount(): number {
        return this._bodyCount;
    }

    public getMass(body: number): number {
        return this._mass[body];
    }

    /** Current position of a body. Returns a new object on every call. */
    public getPosition(body: number): Vector3 {
        return {
            x: this._position[body * 3],
            y: this._position[body * 3 + 1],
            z: this._position[body * 3 + 2],
        };
    }

    /**
     * History points of a body, newest first, for a streak piece.
     * Age 0 is the current position, age 1 the newest stored sample, age 2 the one before, and so on.
     * Returns the points from firstAge to firstAge + segments (inclusive), or fewer if the history is not
     * that long yet. An array with fewer than 2 points means there is nothing to draw.
     */
    public getStreakPoints(body: number, firstAge: number, segments: number): Vector3[] {
        const lastAge = Math.min(firstAge + segments, this._trailCount);
        const points: Vector3[] = [];
        if (lastAge - firstAge < 1) {
            return points;
        }
        for (let age = firstAge; age <= lastAge; age++) {
            points.push(this.pointAtAge(body, age));
        }
        return points;
    }

    /** Marks a body as fixed: it still attracts the others, but its position never changes. */
    public setFixed(body: number, fixed: boolean): void {
        this._fixed[body] = fixed ? 1 : 0;
    }

    /** Calculates the state at the given tick. Restarts from the initial state if the tick is in the past. */
    public advanceTo(tick: number): void {
        if (tick < this._simTick) {
            this.reset();
        }
        while (this._simTick < tick) {
            this.advanceTick();
        }
    }

    /** Back to the initial state at tick 0. */
    public reset(): void {
        this._position.set(this._initialPosition);
        this._velocity.set(this._initialVelocity);
        this._simTick = 0;
        this._trailHead = 0;
        this._trailCount = 0;
        this.computeAcceleration();
    }

    // ---------------------------------------------------------------- initial conditions

    /**
     * Random cluster: random masses, random positions inside a sphere, random velocities plus a common
     * rotation. Velocities are scaled so that kinetic energy = virialRatio * |potential energy|
     * -> bound enough to stay together, hot enough not to collapse into one point.
     * Centre of mass and total momentum are removed so the cluster stays in view. Ends with a reset.
     */
    public createRandomCluster(cluster: NBodyClusterParameters): void {
        const massMax = cluster.massMin * cluster.massRatio;
        let totalMass = 0;
        for (let i = 0; i < this._bodyCount; i++) {
            this._mass[i] = cluster.massMin + Math.random() * (massMax - cluster.massMin);
            totalMass += this._mass[i];
        }

        // Positions: random inside a sphere, not too close to each other
        for (let i = 0; i < this._bodyCount; i++) {
            const p = this.findSpawnPosition(i, cluster.spawnRadius, cluster.minSpawnDistance);
            this._initialPosition[i * 3] = p.x;
            this._initialPosition[i * 3 + 1] = p.y;
            this._initialPosition[i * 3 + 2] = p.z;
        }

        // Move the centre of mass to the origin
        const centre = this.massWeightedMean(this._initialPosition, totalMass);
        for (let i = 0; i < this._bodyCount; i++) {
            this._initialPosition[i * 3] -= centre.x;
            this._initialPosition[i * 3 + 1] -= centre.y;
            this._initialPosition[i * 3 + 2] -= centre.z;
        }

        // Velocities: random motion plus a common rotation around the swirl axis (cross product axis x position)
        const axisLength = Vector3.abs(cluster.swirlAxis);
        const ax = cluster.swirlAxis.x / axisLength;
        const ay = cluster.swirlAxis.y / axisLength;
        const az = cluster.swirlAxis.z / axisLength;
        const swirlScale = cluster.swirlStrength / cluster.spawnRadius;
        for (let i = 0; i < this._bodyCount; i++) {
            const random = this.randomInUnitSphere();
            const rx = this._initialPosition[i * 3];
            const ry = this._initialPosition[i * 3 + 1];
            const rz = this._initialPosition[i * 3 + 2];
            this._initialVelocity[i * 3] = random.x + swirlScale * (ay * rz - az * ry);
            this._initialVelocity[i * 3 + 1] = random.y + swirlScale * (az * rx - ax * rz);
            this._initialVelocity[i * 3 + 2] = random.z + swirlScale * (ax * ry - ay * rx);
        }

        // Remove the total momentum so the cluster does not drift away
        const drift = this.massWeightedMean(this._initialVelocity, totalMass);
        for (let i = 0; i < this._bodyCount; i++) {
            this._initialVelocity[i * 3] -= drift.x;
            this._initialVelocity[i * 3 + 1] -= drift.y;
            this._initialVelocity[i * 3 + 2] -= drift.z;
        }

        // Scale all velocities to the wanted energy ratio
        let kinetic = 0;
        for (let i = 0; i < this._bodyCount; i++) {
            const vx = this._initialVelocity[i * 3];
            const vy = this._initialVelocity[i * 3 + 1];
            const vz = this._initialVelocity[i * 3 + 2];
            kinetic += 0.5 * this._mass[i] * (vx * vx + vy * vy + vz * vz);
        }
        const potential = this.potentialEnergy();
        if (kinetic > 0) {
            const scale = Math.sqrt(cluster.virialRatio * Math.abs(potential) / kinetic);
            for (let k = 0; k < this._initialVelocity.length; k++) {
                this._initialVelocity[k] *= scale;
            }
        }

        this.reset();
    }

    /**
     * Cluster with a heavy central body at index 0 (at the origin) and the planets at index 1 and up.
     * Planets start in a spherical shell around it, moving mostly around orbitAxis at roughly the circular
     * orbit speed for the central body, plus some random deviation. Planets still attract each other, so
     * the motion stays chaotic, only more ordered. The central body gets the opposite of the planets' total
     * momentum, so the system does not drift (ignored if it is fixed). Ends with a reset.
     */
    public createClusterWithCentralBody(cluster: NBodySunClusterParameters): void {
        const planetMassMax = cluster.massMin * cluster.massRatio;
        let planetMassTotal = 0;
        for (let i = 1; i < this._bodyCount; i++) {
            this._mass[i] = cluster.massMin + Math.random() * (planetMassMax - cluster.massMin);
            planetMassTotal += this._mass[i];
        }
        const sunMass = cluster.sunMassFactor * planetMassTotal;
        this._mass[0] = sunMass;

        // Positions: central body at the origin, planets randomly in a shell, not too close to each other
        for (let k = 0; k < 3; k++) {
            this._initialPosition[k] = 0;
        }
        for (let i = 1; i < this._bodyCount; i++) {
            const p = this.findShellSpawnPosition(i, cluster.orbitRadiusMin, cluster.orbitRadiusMax, cluster.minSpawnDistance);
            this._initialPosition[i * 3] = p.x;
            this._initialPosition[i * 3 + 1] = p.y;
            this._initialPosition[i * 3 + 2] = p.z;
        }

        // Velocities: circular orbit speed around the central body, direction mostly tangential plus randomness
        const axisLength = Vector3.abs(cluster.orbitAxis);
        const axis: Vector3 = {
            x: cluster.orbitAxis.x / axisLength,
            y: cluster.orbitAxis.y / axisLength,
            z: cluster.orbitAxis.z / axisLength,
        };
        const softeningSquared = this._parameters.softening * this._parameters.softening;
        let momentumX = 0;
        let momentumY = 0;
        let momentumZ = 0;
        for (let i = 1; i < this._bodyCount; i++) {
            const position: Vector3 = {
                x: this._initialPosition[i * 3],
                y: this._initialPosition[i * 3 + 1],
                z: this._initialPosition[i * 3 + 2],
            };
            const distanceSquared = position.x * position.x + position.y * position.y + position.z * position.z;
            const softened = distanceSquared + softeningSquared;
            // v = sqrt(a * r) with the softened gravity used in the simulation
            const circularSpeed = Math.sqrt(this._parameters.gravitationalConstant * sunMass * distanceSquared / (softened * Math.sqrt(softened)));
            const tangent = this.tangentDirection(axis, position);
            const random = this.randomInUnitSphere();
            const vx = circularSpeed * (tangent.x + cluster.randomness * random.x);
            const vy = circularSpeed * (tangent.y + cluster.randomness * random.y);
            const vz = circularSpeed * (tangent.z + cluster.randomness * random.z);
            this._initialVelocity[i * 3] = vx;
            this._initialVelocity[i * 3 + 1] = vy;
            this._initialVelocity[i * 3 + 2] = vz;
            momentumX += this._mass[i] * vx;
            momentumY += this._mass[i] * vy;
            momentumZ += this._mass[i] * vz;
        }
        this._initialVelocity[0] = -momentumX / sunMass;
        this._initialVelocity[1] = -momentumY / sunMass;
        this._initialVelocity[2] = -momentumZ / sunMass;

        this.reset();
    }

    private findShellSpawnPosition(placedCount: number, radiusMin: number, radiusMax: number, minDistance: number): Vector3 {
        let candidate = this.randomInShell(radiusMin, radiusMax);
        for (let attempt = 1; attempt < MAX_SPAWN_ATTEMPTS && !this.isFarEnoughFromPlaced(candidate, placedCount, minDistance); attempt++) {
            candidate = this.randomInShell(radiusMin, radiusMax);
        }
        return candidate;
    }

    /** Random point between two radii around the origin, evenly distributed by volume. */
    private randomInShell(radiusMin: number, radiusMax: number): Vector3 {
        const radius = Math.cbrt(radiusMin ** 3 + Math.random() * (radiusMax ** 3 - radiusMin ** 3));
        return Vector3.scalarMultiply(radius, this.randomDirection());
    }

    private randomDirection(): Vector3 {
        let v: Vector3;
        let lengthSquared: number;
        do {
            v = this.randomInUnitSphere();
            lengthSquared = v.x * v.x + v.y * v.y + v.z * v.z;
        } while (lengthSquared < 1e-6);
        return Vector3.scalarMultiply(1 / Math.sqrt(lengthSquared), v);
    }

    /** Unit vector perpendicular to the position and the (normalized) axis: the direction of a rotation around the axis. */
    private tangentDirection(axis: Vector3, position: Vector3): Vector3 {
        let t: Vector3 = {
            x: axis.y * position.z - axis.z * position.y,
            y: axis.z * position.x - axis.x * position.z,
            z: axis.x * position.y - axis.y * position.x,
        };
        let length = Vector3.abs(t);
        if (length < 1e-9) {
            // position lies on the axis: use any other axis for the cross product
            const other: Vector3 = Math.abs(axis.x) < 0.9 ? { x: 1, y: 0, z: 0 } : { x: 0, y: 1, z: 0 };
            t = {
                x: other.y * position.z - other.z * position.y,
                y: other.z * position.x - other.x * position.z,
                z: other.x * position.y - other.y * position.x,
            };
            length = Vector3.abs(t);
        }
        return Vector3.scalarMultiply(1 / length, t);
    }

    private findSpawnPosition(placedCount: number, spawnRadius: number, minDistance: number): Vector3 {
        let candidate = Vector3.scalarMultiply(spawnRadius, this.randomInUnitSphere());
        for (let attempt = 1; attempt < MAX_SPAWN_ATTEMPTS && !this.isFarEnoughFromPlaced(candidate, placedCount, minDistance); attempt++) {
            candidate = Vector3.scalarMultiply(spawnRadius, this.randomInUnitSphere());
        }
        return candidate;
    }

    private randomInUnitSphere(): Vector3 {
        let v: Vector3;
        do {
            v = { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1, z: Math.random() * 2 - 1 };
        } while (v.x * v.x + v.y * v.y + v.z * v.z > 1);
        return v;
    }

    private isFarEnoughFromPlaced(p: Vector3, placedCount: number, minDistance: number): boolean {
        for (let j = 0; j < placedCount; j++) {
            const other: Vector3 = {
                x: this._initialPosition[j * 3],
                y: this._initialPosition[j * 3 + 1],
                z: this._initialPosition[j * 3 + 2],
            };
            if (Vector3.distance(p, other) < minDistance) {
                return false;
            }
        }
        return true;
    }

    private massWeightedMean(values: Float64Array, totalMass: number): Vector3 {
        let x = 0;
        let y = 0;
        let z = 0;
        for (let i = 0; i < this._bodyCount; i++) {
            x += this._mass[i] * values[i * 3];
            y += this._mass[i] * values[i * 3 + 1];
            z += this._mass[i] * values[i * 3 + 2];
        }
        return { x: x / totalMass, y: y / totalMass, z: z / totalMass };
    }

    /** Total gravitational potential energy of the initial positions (negative number, same softening as the simulation). */
    private potentialEnergy(): number {
        const softeningSquared = this._parameters.softening * this._parameters.softening;
        let sum = 0;
        for (let i = 0; i < this._bodyCount; i++) {
            for (let j = i + 1; j < this._bodyCount; j++) {
                const dx = this._initialPosition[j * 3] - this._initialPosition[i * 3];
                const dy = this._initialPosition[j * 3 + 1] - this._initialPosition[i * 3 + 1];
                const dz = this._initialPosition[j * 3 + 2] - this._initialPosition[i * 3 + 2];
                const distance = Math.sqrt(dx * dx + dy * dy + dz * dz + softeningSquared);
                sum -= this._parameters.gravitationalConstant * this._mass[i] * this._mass[j] / distance;
            }
        }
        return sum;
    }

    // ---------------------------------------------------------------- simulation

    private advanceTick(): void {
        for (let s = 0; s < this._parameters.substepsPerTick; s++) {
            this.step();
        }
        this._simTick++;
        if (this._simTick % this._parameters.streakSampleInterval === 0) {
            this.recordTrailSample();
        }
    }

    /**
     * One Velocity-Verlet step in "kick-drift-kick" form:
     * half velocity update, full position update, new accelerations, second half velocity update.
     * Fixed bodies are skipped, so they stay where they are.
     */
    private step(): void {
        const dt = this._parameters.timePerTick / this._parameters.substepsPerTick;
        const halfDt = 0.5 * dt;
        const pos = this._position;
        const vel = this._velocity;
        const acc = this._acceleration;
        for (let i = 0; i < this._bodyCount; i++) {
            if (this._fixed[i]) {
                continue;
            }
            for (let k = i * 3; k < i * 3 + 3; k++) {
                vel[k] += acc[k] * halfDt;
                pos[k] += vel[k] * dt;
            }
        }
        this.computeAcceleration();
        for (let i = 0; i < this._bodyCount; i++) {
            if (this._fixed[i]) {
                continue;
            }
            for (let k = i * 3; k < i * 3 + 3; k++) {
                vel[k] += acc[k] * halfDt;
            }
        }
    }

    /** Gravity between all pairs. Each pair is calculated once and applied to both bodies (Newton's third law). */
    private computeAcceleration(): void {
        const pos = this._position;
        const acc = this._acceleration;
        const mass = this._mass;
        const g = this._parameters.gravitationalConstant;
        const softeningSquared = this._parameters.softening * this._parameters.softening;
        acc.fill(0);
        for (let i = 0; i < this._bodyCount; i++) {
            const i3 = i * 3;
            for (let j = i + 1; j < this._bodyCount; j++) {
                const j3 = j * 3;
                const dx = pos[j3] - pos[i3];
                const dy = pos[j3 + 1] - pos[i3 + 1];
                const dz = pos[j3 + 2] - pos[i3 + 2];
                const distanceSquared = dx * dx + dy * dy + dz * dz + softeningSquared;
                const inverseDistanceCubed = g / (distanceSquared * Math.sqrt(distanceSquared));
                const factorI = mass[j] * inverseDistanceCubed;
                const factorJ = mass[i] * inverseDistanceCubed;
                acc[i3] += dx * factorI;
                acc[i3 + 1] += dy * factorI;
                acc[i3 + 2] += dz * factorI;
                acc[j3] -= dx * factorJ;
                acc[j3 + 1] -= dy * factorJ;
                acc[j3 + 2] -= dz * factorJ;
            }
        }
    }

    // ---------------------------------------------------------------- streak history

    private recordTrailSample(): void {
        const samples = this._parameters.streakSamples;
        for (let i = 0; i < this._bodyCount; i++) {
            const target = (i * samples + this._trailHead) * 3;
            this._trail[target] = this._position[i * 3];
            this._trail[target + 1] = this._position[i * 3 + 1];
            this._trail[target + 2] = this._position[i * 3 + 2];
        }
        this._trailHead = (this._trailHead + 1) % samples;
        this._trailCount = Math.min(this._trailCount + 1, samples);
    }

    /** Age 0 is the current position, age 1 the newest stored sample, age 2 the one before, and so on. */
    private pointAtAge(body: number, age: number): Vector3 {
        if (age === 0) {
            return this.getPosition(body);
        }
        const samples = this._parameters.streakSamples;
        const slot = (this._trailHead - age + samples) % samples;
        const base = (body * samples + slot) * 3;
        return { x: this._trail[base], y: this._trail[base + 1], z: this._trail[base + 2] };
    }
}