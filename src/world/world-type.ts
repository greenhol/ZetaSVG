export type WorldId =
    | 'PLAYGROUND'
    | 'MEASUREMENTS'
    | 'DOT_CUBE'
    | 'HILBERT_CURVE'
    | 'BELL_CURVE'
    | 'RANDOM_POINTS'
    | 'BOUNCING_PARTICLES'
    | 'DOUBLE_PENDULUM_2D'
    | 'DOUBLE_PENDULUM_3D'
    | 'SOLAR_SYSTEM'
    | 'RICHTERS_RECTANGLES';

export type RealmId =
    | 'SANDBOX_DEBUGGING'
    | 'MATHEMATICAL_VISUALIZATIONS'
    | 'PHYSICS_SIMULATIONS'
    | 'ARTISTIC_EXPERIMENTS';

export interface WorldType {
    id: WorldId;
    name: string;
    description: string;
}

export interface Realm {
    id: RealmId;
    name: string;
    worlds: WorldType[];
}

export const REALMS: Realm[] = [
    {
        id: 'SANDBOX_DEBUGGING',
        name: "Sandbox & Debugging",
        worlds: [
            { id: 'PLAYGROUND', name: "Playground", description: "A freeform space for testing and experimentation." },
            { id: 'MEASUREMENTS', name: "Measurements", description: "Compare sizes and dimensions of 3D objects." },
            { id: 'DOT_CUBE', name: "Dot Cube", description: "A grid of dots arranged as a 3D cube." },
        ],
    },
    {
        id: 'MATHEMATICAL_VISUALIZATIONS',
        name: "Mathematical Visualizations",
        worlds: [
            { id: 'HILBERT_CURVE', name: "Hilbert Curve", description: "A 3D Hilbert curve growing from a single point." },
            { id: 'BELL_CURVE', name: "Bell Curve", description: "An animated 3D bell curve with moving amplitude." },
            { id: 'RANDOM_POINTS', name: "Random Points", description: "Points performing a random walk from the center." },
        ],
    },
    {
        id: 'PHYSICS_SIMULATIONS',
        name: "Physics Simulations",
        worlds: [
            { id: 'BOUNCING_PARTICLES', name: "Bouncing Particles", description: "Particles explode, fall, and bounce with gravity." },
            { id: 'DOUBLE_PENDULUM_2D', name: "Double Pendulum 2D", description: "A grid of 2D double pendulums with varied starting points." },
            { id: 'DOUBLE_PENDULUM_3D', name: "Double Pendulum 3D", description: "A single double pendulum animated in 3D space." },
            { id: 'SOLAR_SYSTEM', name: "Solar System", description: "A simplified, animated model of our solar system." },
        ],
    },
    {
        id: 'ARTISTIC_EXPERIMENTS',
        name: "Artistic Experiments",
        worlds: [
            { id: 'RICHTERS_RECTANGLES', name: "Richters Rectangles", description: "Colorful rectangles inspired by Gerhard Richter’s work." },
        ],
    },
];

export namespace WorldType {

    export function getRealm(worldId: WorldId): Realm | null {
        const realm = REALMS.find(r => r.worlds.some(w => w.id === worldId));
        if (!realm) {
            console.error(`#getWorldIndex - WorldId "${worldId}" not found in any realm.`);
            return null;
        }
        return realm;
    }

    export function getRealmById(realmId: RealmId): Realm | null {
        const realm = REALMS.find(r => r.id === realmId);
        if (!realm) {
            console.error(`#getWorldIndex - RealmId "${realmId}" not found.`);
            return null;
        }
        return realm;
    }

    export function getWorldById(worldId: WorldId): WorldType | null {
        const realm = getRealm(worldId);
        if (!realm) return null;
        return realm.worlds.find(w => w.id === worldId) ?? null;
    }

    export function getWorldNumber(worldId: WorldId): number {
        const realm = getRealm(worldId);
        if (realm == undefined) return 1;
        return realm.worlds.findIndex(w => w.id === worldId) + 1;
    }
}