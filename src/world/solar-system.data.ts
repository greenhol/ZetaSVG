interface CelestialData {
    size: number; // internal units - not precice
    distance: number; // internal units - not precice
    speed: number; // in degree per day
}

interface PlanetData {
    mercury: CelestialData;
    venus: CelestialData;
    earth: CelestialData;
    mars: CelestialData;
    jupiter: CelestialData;
    saturn: CelestialData;
    uranus: CelestialData;
    neptune: CelestialData;
}

interface MoonData {
    earthLuna: CelestialData;
    jupiterIo: CelestialData;
    jupiterEuropa: CelestialData;
    jupiterGanymede: CelestialData;
    jupiterCallisto: CelestialData;
    saturnTitan: CelestialData;
    uranusTitania: CelestialData;
    neptuneTriton: CelestialData;
}

export interface OrbitalAngles {
    mercury: number;
    venus: number;
    earth: number;
    earthLuna: number;
    mars: number;
    jupiter: number;
    jupiterIo: number;
    jupiterEuropa: number;
    jupiterGanymede: number;
    jupiterCallisto: number;
    saturn: number;
    saturnTitan: number;
    uranus: number;
    uranusTitania: number;
    neptune: number;
    neptuneTriton: number;
}

export const PLANETS: PlanetData = {
    mercury: { size: 0.35, distance: 2, speed: 4.0923373 },
    venus: { size: 0.88, distance: 2.5, speed: 1.6021303 },
    earth: { size: 0.92, distance: 2.85, speed: 0.9856474 },
    mars: { size: 0.49, distance: 3.3, speed: 0.5240335 },
    jupiter: { size: 10.5, distance: 4.5, speed: 0.0830864 },
    saturn: { size: 8.86, distance: 6, speed: 0.0334597 },
    uranus: { size: 3.76, distance: 7.2, speed: 0.0117299 },
    neptune: { size: 3.65, distance: 8, speed: 0.0059810 },
}

export const MOONS: MoonData = {
    earthLuna: { size: 0.3, distance: 0.1, speed: 13.176358 },
    jupiterIo: { size: 0.312, distance: 0.65, speed: 203.489 },
    jupiterEuropa: { size: 0.27, distance: 0.7, speed: 101.376 },
    jupiterGanymede: { size: 0.45, distance: 0.75, speed: 50.316 },
    jupiterCallisto: { size: 0.414, distance: 0.83, speed: 21.569 },
    saturnTitan: { size: 0.441, distance: 0.55, speed: 22.571 },
    uranusTitania: { size: 0.135, distance: 0.3, speed: 41.351 },
    neptuneTriton: { size: 0.234, distance: 0.3, speed: -61.736 },
}

// Positions of the planets at January 1st 2000, Moons irrelevant
export const REFERENCE_ANGLES: OrbitalAngles = {
    mercury: 252.2509,
    venus: 181.9798,
    earth: 100.4644,
    earthLuna: 0,
    mars: 355.4333,
    jupiter: 34.3515,
    jupiterIo: 0,
    jupiterEuropa: 0,
    jupiterGanymede: 0,
    jupiterCallisto: 0,
    saturn: 49.9443,
    saturnTitan: 0,
    uranus: 313.2322,
    uranusTitania: 0,
    neptune: 304.8800,
    neptuneTriton: 0,
}
