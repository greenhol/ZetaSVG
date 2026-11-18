export type WorldId =
    | 'PLAYGROUND'
    | 'MEASUREMENTS'
    | 'DOT_CUBE'
    | 'HILBERT_CURVE'
    | 'BELL_CURVE'
    | 'LISSAJOUS'
    | 'RANDOM_POINTS'
    | 'POLYCHORON'
    | 'HOPF_FIBRATION'
    | 'BOUNCING_PARTICLES'
    | 'DOUBLE_PENDULUM_2D'
    | 'DOUBLE_PENDULUM_3D'
    | 'SOLAR_SYSTEM'
    | 'N_BODY'
    | 'N_BODY_WITH_SUN'
    | 'RICHTERS_RECTANGLES'
    | 'PROCEDURAL_TREE'
    | 'COLOUR_SPACES_2D'
    | 'COLOUR_SPACES_3D'
    | 'DOUBLE_HELIX_DNA';

export type RealmId =
    | 'SANDBOX_DEBUGGING'
    | 'MATHEMATICAL_VISUALIZATIONS'
    | 'PHYSICS_SIMULATIONS'
    | 'SCIENTIFIC'
    | 'MISC';

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
        name: 'Sandbox & Debugging',
        worlds: [
            { id: 'PLAYGROUND', name: 'Playground', description: 'A freeform space for testing and experimentation.' },
            { id: 'MEASUREMENTS', name: 'Measurements', description: 'Compare sizes and dimensions of 3D objects.' },
            { id: 'DOT_CUBE', name: 'Dot Cube', description: 'A grid of dots arranged as a 3D cube.' },
            { id: 'RANDOM_POINTS', name: 'Random Points', description: 'Points performing a random walk from the center.' },
        ],
    },
    {
        id: 'MATHEMATICAL_VISUALIZATIONS',
        name: 'Mathematical Visualizations',
        worlds: [
            { id: 'HILBERT_CURVE', name: 'Hilbert Curve', description: 'A 3D Hilbert curve growing from a single point.' },
            { id: 'BELL_CURVE', name: 'Bell Curve', description: 'An animated 3D bell curve with moving amplitude.' },
            { id: 'POLYCHORON', name: 'Polychora', description: '3D projection of different Polychoras.' },
            { id: 'HOPF_FIBRATION', name: 'Hopf Fireation', description: '3D projection of the Hopf Fireation.' },
            { id: 'LISSAJOUS', name: 'Lissajous', description: 'Lissajous 3D Curves' },
        ],
    },
    {
        id: 'PHYSICS_SIMULATIONS',
        name: 'Physics Simulations',
        worlds: [
            { id: 'SOLAR_SYSTEM', name: 'Solar System', description: 'A simplified, animated model of our solar system.' },
            { id: 'N_BODY', name: 'N Body', description: 'N Bodies flying around being attracted by gravity' },
            { id: 'N_BODY_WITH_SUN', name: 'N Body with Sun', description: 'N Bodies flying around a sun being attracted by gravity' },
            { id: 'BOUNCING_PARTICLES', name: 'Bouncing Particles', description: 'Particles explode, fall, and bounce with gravity.' },
            { id: 'DOUBLE_PENDULUM_2D', name: 'Double Pendulum 2D', description: 'A grid of 2D double pendulums with varied starting points.' },
            { id: 'DOUBLE_PENDULUM_3D', name: 'Double Pendulum 3D', description: 'A single double pendulum animated in 3D space.' },
        ],
    },
    {
        id: 'SCIENTIFIC',
        name: 'Scientific',
        worlds: [
            { id: 'COLOUR_SPACES_2D', name: 'Colour Spaces 2D', description: 'Display of different Colours in the CIE Space' },
            { id: 'COLOUR_SPACES_3D', name: 'Colour Spaces 3D', description: 'ToDo' },
            { id: 'DOUBLE_HELIX_DNA', name: 'DNA', description: 'ToDo' },
        ],
    },
    {
        id: 'MISC',
        name: 'Miscellaneous',
        worlds: [
            { id: 'RICHTERS_RECTANGLES', name: 'Richters Rectangles', description: 'Colourful rectangles inspired by Gerhard Richter’s work.' },
            { id: 'PROCEDURAL_TREE', name: 'Procedural Tree', description: 'Procedurally generated tree' },
        ],
    },
];

export namespace WorldType {

    export function getRealm(worldId: WorldId): Realm | null {
        const realm = REALMS.find(r => r.worlds.some(w => w.id === worldId));
        if (!realm) {
            console.error(`#getWorldIndex - WorldId '${worldId}' not found in any realm.`);
            return null;
        }
        return realm;
    }

    export function getRealmById(realmId: RealmId): Realm | null {
        const realm = REALMS.find(r => r.id === realmId);
        if (!realm) {
            console.error(`#getWorldIndex - RealmId '${realmId}' not found.`);
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