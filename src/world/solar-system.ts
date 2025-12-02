import { ModuleConfig } from '../config/module-config';
import { ONE_DEGREE } from '../types/constants';
import { Perspective } from '../types/perspective';
import { Circle3d } from '../types/shape/circle';
import { Text3d } from '../types/shape/text';
import { createOrigin, SpaceCoord } from '../types/space-coord';
import { MOONS, OrbitalAngles, PLANETS, REFERENCE_ANGLES } from './solar-system.data';
import { earthStyle, infoTextStyle, jupiterStyle, marsStyle, mercuryStyle, moonStyle, neptuneStyle, saturnStyle, sunStyle, uranusStyle, venusStyle } from './solar-system.styles';
import { World, WorldConfig } from './world';

interface SolarSystemConfig extends WorldConfig {
    cameraPerspective: Perspective;
    speed: number;
}

export class SolarSystem extends World {
    private _orbitalAngles = this.calculateInitialPositions(1977, 7, 8);

    private _sun: Circle3d;
    private _sunInfo: Text3d;

    private _mercury: Circle3d;
    private _mercuryInfo: Text3d;

    private _venus: Circle3d;
    private _venusInfo: Text3d;

    private _earth: Circle3d;
    private _earthInfo: Text3d;
    private _earthLuna: Circle3d;

    private _mars: Circle3d;
    private _marsInfo: Text3d;

    private _jupiter: Circle3d;
    private _jupiterInfo: Text3d;
    private _jupiterIo: Circle3d;
    private _jupiterEuropa: Circle3d;
    private _jupiterGanymede: Circle3d;
    private _jupiterCalisto: Circle3d;

    private _saturn: Circle3d;
    private _saturnInfo: Text3d;
    private _saturnTitan: Circle3d;

    private _uranus: Circle3d;
    private _uranusInfo: Text3d;
    private _uranusTitania: Circle3d;

    private _neptune: Circle3d;
    private _neptuneInfo: Text3d;
    private _neptuneTriton: Circle3d;

    constructor() {
        super();

        const sunPosition = createOrigin();
        this._sun = new Circle3d(sunPosition, 25, sunStyle);
        this._sunInfo = new Text3d(this.planetInfoPosition(sunPosition, 25), "Sun", infoTextStyle(sunStyle.fill));

        const mercuryPosition = this.planetPosition(PLANETS.mercury.distance, this._orbitalAngles.mercury);
        this._mercury = new Circle3d(mercuryPosition, PLANETS.mercury.size, mercuryStyle);
        this._mercuryInfo = new Text3d(this.planetInfoPosition(mercuryPosition, PLANETS.mercury.size), "Mercury", infoTextStyle(mercuryStyle.fill));

        const venusPosition = this.planetPosition(PLANETS.venus.distance, this._orbitalAngles.venus);
        this._venus = new Circle3d(venusPosition, PLANETS.venus.size, venusStyle);
        this._venusInfo = new Text3d(this.planetInfoPosition(venusPosition, PLANETS.venus.size), "Venus", infoTextStyle(venusStyle.fill));

        const earthPosition = this.planetPosition(PLANETS.earth.distance, this._orbitalAngles.earth);
        this._earth = new Circle3d(earthPosition, PLANETS.earth.size, earthStyle);
        this._earthInfo = new Text3d(this.planetInfoPosition(earthPosition, PLANETS.earth.size), "Earth", infoTextStyle(earthStyle.fill));
        this._earthLuna = new Circle3d(this.moonPosition(earthPosition, MOONS.earthLuna.distance, this._orbitalAngles.earthLuna), MOONS.earthLuna.size, moonStyle);

        const marsPosition = this.planetPosition(PLANETS.mars.distance, this._orbitalAngles.mars);
        this._mars = new Circle3d(marsPosition, PLANETS.mars.size, marsStyle);
        this._marsInfo = new Text3d(this.planetInfoPosition(marsPosition, PLANETS.mars.size), "Mars", infoTextStyle(marsStyle.fill));

        const jupiterPosition = this.planetPosition(PLANETS.jupiter.distance, this._orbitalAngles.jupiter)
        this._jupiter = new Circle3d(jupiterPosition, PLANETS.jupiter.size, jupiterStyle);
        this._jupiterInfo = new Text3d(this.planetInfoPosition(jupiterPosition, PLANETS.jupiter.size), "Jupiter", infoTextStyle(jupiterStyle.fill));
        this._jupiterIo = new Circle3d(this.moonPosition(jupiterPosition, MOONS.jupiterIo.distance, this._orbitalAngles.jupiterIo), MOONS.jupiterIo.size, moonStyle);
        this._jupiterEuropa = new Circle3d(this.moonPosition(jupiterPosition, MOONS.jupiterEuropa.distance, this._orbitalAngles.jupiterEuropa), MOONS.jupiterEuropa.size, moonStyle);
        this._jupiterGanymede = new Circle3d(this.moonPosition(jupiterPosition, MOONS.jupiterGanymede.distance, this._orbitalAngles.jupiterGanymede), MOONS.jupiterGanymede.size, moonStyle);
        this._jupiterCalisto = new Circle3d(this.moonPosition(jupiterPosition, MOONS.jupiterCallisto.distance, this._orbitalAngles.jupiterCallisto), MOONS.jupiterCallisto.size, moonStyle);

        const saturnPosition = this.planetPosition(PLANETS.saturn.distance, this._orbitalAngles.saturn);
        this._saturn = new Circle3d(saturnPosition, PLANETS.saturn.size, saturnStyle);
        this._saturnInfo = new Text3d(this.planetInfoPosition(saturnPosition, PLANETS.saturn.size), "Saturn", infoTextStyle(saturnStyle.fill));
        this._saturnTitan = new Circle3d(this.moonPosition(saturnPosition, MOONS.saturnTitan.distance, this._orbitalAngles.saturnTitan), MOONS.saturnTitan.size, moonStyle);

        const uranusPosition = this.planetPosition(PLANETS.uranus.distance, this._orbitalAngles.uranus);
        this._uranus = new Circle3d(uranusPosition, PLANETS.uranus.size, uranusStyle);
        this._uranusInfo = new Text3d(this.planetInfoPosition(uranusPosition, PLANETS.uranus.size), "Uranus", infoTextStyle(uranusStyle.fill));
        this._uranusTitania = new Circle3d(this.moonPosition(uranusPosition, MOONS.uranusTitania.distance, this._orbitalAngles.uranusTitania), MOONS.uranusTitania.size, moonStyle);

        const neptunePosition = this.planetPosition(PLANETS.neptune.distance, this._orbitalAngles.neptune);
        this._neptune = new Circle3d(neptunePosition, PLANETS.neptune.size, neptuneStyle);
        this._neptuneInfo = new Text3d(this.planetInfoPosition(neptunePosition, PLANETS.neptune.size), "Neptune", infoTextStyle(neptuneStyle.fill));
        this._neptuneTriton = new Circle3d(this.moonPosition(neptunePosition, MOONS.neptuneTriton.distance, this._orbitalAngles.neptuneTriton), MOONS.neptuneTriton.size, moonStyle);

        this.circles = [
            this._sun,
            this._mercury,
            this._venus,
            this._earth, this._earthLuna,
            this._mars,
            this._jupiter, this._jupiterIo, this._jupiterEuropa, this._jupiterGanymede, this._jupiterCalisto,
            this._saturn, this._saturnTitan,
            this._uranus, this._uranusTitania,
            this._neptune, this._neptuneTriton,
        ];
        this.texts = [
            this._sunInfo,
            this._mercuryInfo,
            this._venusInfo,
            this._earthInfo,
            this._marsInfo,
            this._jupiterInfo,
            this._saturnInfo,
            this._uranusInfo,
            this._neptuneInfo,
        ];

        this.init();
    }

    override config = new ModuleConfig<SolarSystemConfig>(
        {
            cameraPerspective: {
                position: { x: 0, y: -1, z: -8.5 },
                angleX: 35 * ONE_DEGREE,
                angleY: 330 * ONE_DEGREE,
                angleZ: 0 * ONE_DEGREE,
            },
            // cameraPerspective: {
            //     position: { x: 4, y: 0, z: -3.5 },
            //     angleX: 90 * ONE_DEGREE,
            //     angleY: 0 * ONE_DEGREE,
            //     angleZ: 0 * ONE_DEGREE,
            // },
            speed: 1 / 24, // 1h per tick
        },
        "solarSystemConfig",
    );

    override backgroundColor = '#000';

    public name: string = "SolarSystem";

    override transitionToStateAt(t: number): void {

        const speedFactor = this.config.data.speed;

        this._orbitalAngles.mercury += PLANETS.mercury.speed * speedFactor;
        this._mercury.position = this.planetPosition(PLANETS.mercury.distance, this._orbitalAngles.mercury);
        this._mercuryInfo.position = this.planetInfoPosition(this._mercury.position, PLANETS.mercury.size);

        this._orbitalAngles.venus += PLANETS.venus.speed * speedFactor;
        this._venus.position = this.planetPosition(PLANETS.venus.distance, this._orbitalAngles.venus);
        this._venusInfo.position = this.planetInfoPosition(this._venus.position, PLANETS.venus.size);

        this._orbitalAngles.earth += PLANETS.earth.speed * speedFactor;
        this._earth.position = this.planetPosition(PLANETS.earth.distance, this._orbitalAngles.earth);
        this._earthInfo.position = this.planetInfoPosition(this._earth.position, PLANETS.earth.size);
        this._orbitalAngles.earthLuna += MOONS.earthLuna.speed * speedFactor;
        this._earthLuna.position = this.moonPosition(this._earth.position, MOONS.earthLuna.distance, this._orbitalAngles.earthLuna);

        this._orbitalAngles.mars += PLANETS.mars.speed * speedFactor;
        this._mars.position = this.planetPosition(PLANETS.mars.distance, this._orbitalAngles.mars);
        this._marsInfo.position = this.planetInfoPosition(this._mars.position, PLANETS.mars.size);

        this._orbitalAngles.jupiter += PLANETS.jupiter.speed * speedFactor;
        this._jupiter.position = this.planetPosition(PLANETS.jupiter.distance, this._orbitalAngles.jupiter);
        this._jupiterInfo.position = this.planetInfoPosition(this._jupiter.position, PLANETS.jupiter.size);
        this._orbitalAngles.jupiterIo += MOONS.jupiterIo.speed * speedFactor;
        this._jupiterIo.position = this.moonPosition(this._jupiter.position, MOONS.jupiterIo.distance, this._orbitalAngles.jupiterIo);
        this._orbitalAngles.jupiterEuropa += MOONS.jupiterEuropa.speed * speedFactor;
        this._jupiterEuropa.position = this.moonPosition(this._jupiter.position, MOONS.jupiterEuropa.distance, this._orbitalAngles.jupiterEuropa);
        this._orbitalAngles.jupiterGanymede += MOONS.jupiterGanymede.speed * speedFactor;
        this._jupiterGanymede.position = this.moonPosition(this._jupiter.position, MOONS.jupiterGanymede.distance, this._orbitalAngles.jupiterGanymede);
        this._orbitalAngles.jupiterCallisto += MOONS.jupiterCallisto.speed * speedFactor;
        this._jupiterCalisto.position = this.moonPosition(this._jupiter.position, MOONS.jupiterCallisto.distance, this._orbitalAngles.jupiterCallisto);

        this._orbitalAngles.saturn += PLANETS.saturn.speed * speedFactor;
        this._saturn.position = this.planetPosition(PLANETS.saturn.distance, this._orbitalAngles.saturn);
        this._saturnInfo.position = this.planetInfoPosition(this._saturn.position, PLANETS.saturn.size);
        this._orbitalAngles.saturnTitan += MOONS.saturnTitan.speed * speedFactor;
        this._saturnTitan.position = this.moonPosition(this._saturn.position, MOONS.saturnTitan.distance, this._orbitalAngles.saturnTitan);

        this._orbitalAngles.uranus += PLANETS.uranus.speed * speedFactor;
        this._uranus.position = this.planetPosition(PLANETS.uranus.distance, this._orbitalAngles.uranus);
        this._uranusInfo.position = this.planetInfoPosition(this._uranus.position, PLANETS.uranus.size);
        this._orbitalAngles.uranusTitania += MOONS.uranusTitania.speed * speedFactor;
        this._uranusTitania.position = this.moonPosition(this._uranus.position, MOONS.uranusTitania.distance, this._orbitalAngles.uranusTitania);

        this._orbitalAngles.neptune += PLANETS.neptune.speed * speedFactor;
        this._neptune.position = this.planetPosition(PLANETS.neptune.distance, this._orbitalAngles.neptune);
        this._neptuneInfo.position = this.planetInfoPosition(this._neptune.position, PLANETS.neptune.size);
        this._orbitalAngles.neptuneTriton -= MOONS.neptuneTriton.speed * speedFactor; // only one rotating clockwise
        this._neptuneTriton.position = this.moonPosition(this._neptune.position, MOONS.neptuneTriton.distance, this._orbitalAngles.neptuneTriton);
    }

    private planetPosition(distance: number, angle: number): SpaceCoord {
        return {
            x: distance * Math.cos(angle * ONE_DEGREE),
            y: 0,
            z: distance * Math.sin(angle * ONE_DEGREE),
        }
    }

    private planetInfoPosition(planetPosition: SpaceCoord, offset: number): SpaceCoord {
        return {
            x: planetPosition.x,
            y: 0.15 + offset / 20,
            z: planetPosition.z
        }
    }

    private moonPosition(planetPosition: SpaceCoord, distance2: number, angle2: number): SpaceCoord {
        return {
            x: planetPosition.x + distance2 * Math.cos(angle2 * ONE_DEGREE),
            y: 0,
            z: planetPosition.z + distance2 * Math.sin(angle2 * ONE_DEGREE),
        }
    }

    private calculateInitialPositions(year: number, month: number, day: number): OrbitalAngles {
        const referenceDate = new Date(2000, 0, 1);
        const targetDate = new Date(year, month - 1, day);
        const diffInDays = (targetDate.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24);

        return {
            mercury: REFERENCE_ANGLES.mercury + (diffInDays * PLANETS.mercury.speed) % 360,
            venus: REFERENCE_ANGLES.venus + (diffInDays * PLANETS.venus.speed) % 360,
            earth: REFERENCE_ANGLES.earth + (diffInDays * PLANETS.earth.speed) % 360,
            earthLuna: Math.random() * 360,
            mars: REFERENCE_ANGLES.mars + (diffInDays * PLANETS.mars.speed) % 360,
            jupiter: REFERENCE_ANGLES.jupiter + (diffInDays * PLANETS.jupiter.speed) % 360,
            jupiterIo: Math.random() * 360,
            jupiterEuropa: Math.random() * 360,
            jupiterGanymede: Math.random() * 360,
            jupiterCallisto: Math.random() * 360,
            saturn: REFERENCE_ANGLES.saturn + (diffInDays * PLANETS.saturn.speed) % 360,
            saturnTitan: Math.random() * 360,
            uranus: REFERENCE_ANGLES.uranus + (diffInDays * PLANETS.uranus.speed) % 360,
            uranusTitania: Math.random() * 360,
            neptune: REFERENCE_ANGLES.neptune + (diffInDays * PLANETS.neptune.speed) % 360,
            neptuneTriton: Math.random() * 360,
        }
    }
}