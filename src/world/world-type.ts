import type { World } from './world';

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
    | 'DZHANIBEKOV'
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
            { id: 'DZHANIBEKOV', name: 'Dzhanibekov Effect', description: 'Dzhanibekov Effect animating' },
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

export const WORLD_LOADERS: Record<WorldId, () => Promise<World>> = {
    PLAYGROUND: () => import(/* webpackChunkName: "Playground" */ './playground/playground').then(m => new m.Playground()),
    MEASUREMENTS: () => import(/* webpackChunkName: "Measurements" */ './measurements/measuremants').then(m => new m.Measurements()),
    DOT_CUBE: () => import(/* webpackChunkName: "DotCube" */ './dot-cube/dot-cube').then(m => new m.DotCube()),
    HILBERT_CURVE: () => import(/* webpackChunkName: "HilbertCurve" */ './hilbert-curve/hilbert-curve').then(m => new m.HilbertCurve()),
    BELL_CURVE: () => import(/* webpackChunkName: "BellCurve" */ './bell-curve/bell-curve').then(m => new m.BellCurve()),
    LISSAJOUS: () => import(/* webpackChunkName: "Lissajous" */ './lissajous/lissajous').then(m => new m.Lissajous()),
    RANDOM_POINTS: () => import(/* webpackChunkName: "RandomPoints" */ './random-points/random-points').then(m => new m.RandomPoints()),
    POLYCHORON: () => import(/* webpackChunkName: "Polychoron" */ './polychoron/polychoron').then(m => new m.Polychoron()),
    HOPF_FIBRATION: () => import(/* webpackChunkName: "HopfFibration" */ './hopf-fibration/hopf-fibration').then(m => new m.HopfFibration()),
    BOUNCING_PARTICLES: () => import(/* webpackChunkName: "BouncingParticles" */ './bouncing-particles/bouncing-particles').then(m => new m.BouncingParticles()),
    DOUBLE_PENDULUM_2D: () => import(/* webpackChunkName: "DoublePendulum2d" */ './double-pendulum/2d/double-pendulum-2d').then(m => new m.DoublePendulum2d()),
    DOUBLE_PENDULUM_3D: () => import(/* webpackChunkName: "DoublePendulum3d" */ './double-pendulum/3d/double-pendulum-3d').then(m => new m.DoublePendulum3d()),
    DZHANIBEKOV: () => import(/* webpackChunkName: "DzhanibekovEffect" */ './dzhanibekov-effect/dzhanibekov-effect').then(m => new m.DzhanibekovEffect()),
    SOLAR_SYSTEM: () => import(/* webpackChunkName: "SolarSystem" */ './solar-system/solar-system').then(m => new m.SolarSystem()),
    N_BODY: () => import(/* webpackChunkName: "NBody" */ './n-body/default/n-body').then(m => new m.NBody()),
    N_BODY_WITH_SUN: () => import(/* webpackChunkName: "NBody" */ './n-body/with-sun/n-body-with-sun').then(m => new m.NBodyWithSun()),
    RICHTERS_RECTANGLES: () => import(/* webpackChunkName: "RichtersRectangles" */ './richters-rectangles/richters-rectangles').then(m => new m.RichtersRectangles()),
    PROCEDURAL_TREE: () => import(/* webpackChunkName: "ProceduralTree" */ './procedural-tree/procedural-tree').then(m => new m.ProceduralTree()),
    COLOUR_SPACES_2D: () => import(/* webpackChunkName: "ColourSpaces" */ './colour-spaces/2d/colour-spaces-2d').then(m => new m.ColourSpaces2D()),
    COLOUR_SPACES_3D: () => import(/* webpackChunkName: "ColourSpaces" */ './colour-spaces/3d/colour-spaces-3d').then(m => new m.ColourSpaces3D()),
    DOUBLE_HELIX_DNA: () => import(/* webpackChunkName: "DoubleHelix" */ './double-helix/double-helix').then(m => new m.DoubleHelix()),
};

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