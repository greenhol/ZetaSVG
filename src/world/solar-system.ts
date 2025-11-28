import { ModuleConfig } from '../config/module-config';
import { ONE_DEGREE } from '../types/constants';
import { Perspective } from '../types/perspective';
import { Circle3d } from '../types/shape/circle';
import { createOrigin, SpaceCoord } from '../types/space-coord';
import { MOONS, OrbitalAngles, PLANETS, REFERENCE_ANGLES } from './solar-system.data';
import { earthStyle, jupiterStyle, marsStyle, mercuryStyle, moonStyle, neptuneStyle, saturnStyle, sunStyle, uranusStyle, venusStyle } from './solar-system.styles';
import { World, WorldConfig } from './world';

interface SolarSystemConfig extends WorldConfig {
    cameraPerspective: Perspective;
    speed: number;
}

export class SolarSystem extends World {
    private _orbitalAngles = this.calculateInitialPositions(1977, 7, 8);

    private _sun = new Circle3d(createOrigin(), 25, sunStyle);
    private _mercury = new Circle3d(this.planetPosition(PLANETS.mercury.distance, this._orbitalAngles.mercury), PLANETS.mercury.size, mercuryStyle);
    private _venus = new Circle3d(this.planetPosition(PLANETS.venus.distance, this._orbitalAngles.venus), PLANETS.venus.size, venusStyle);
    private _earth = new Circle3d(this.planetPosition(PLANETS.earth.distance, this._orbitalAngles.earth), PLANETS.earth.size, earthStyle);
    private _earthMoon1 = new Circle3d(this.moonPosition(PLANETS.earth.distance, this._orbitalAngles.earth, MOONS.earthLuna.distance, this._orbitalAngles.earthLuna), MOONS.earthLuna.size, moonStyle);
    private _mars = new Circle3d(this.planetPosition(PLANETS.mars.distance, this._orbitalAngles.mars), PLANETS.mars.size, marsStyle);
    private _jupiter = new Circle3d(this.planetPosition(PLANETS.jupiter.distance, this._orbitalAngles.jupiter), PLANETS.jupiter.size, jupiterStyle);
    private _jupiterMoon1Io = new Circle3d(this.moonPosition(PLANETS.jupiter.distance, this._orbitalAngles.jupiter, MOONS.jupiterIo.distance, this._orbitalAngles.jupiterIo), MOONS.jupiterIo.size, moonStyle);
    private _jupiterMoon2Europa = new Circle3d(this.moonPosition(PLANETS.jupiter.distance, this._orbitalAngles.jupiter, MOONS.jupiterEuropa.distance, this._orbitalAngles.jupiterEuropa), MOONS.jupiterEuropa.size, moonStyle);
    private _jupiterMoon3Ganymede = new Circle3d(this.moonPosition(PLANETS.jupiter.distance, this._orbitalAngles.jupiter, MOONS.jupiterGanymede.distance, this._orbitalAngles.jupiterGanymede), MOONS.jupiterGanymede.size, moonStyle);
    private _jupiterMoon4Calisto = new Circle3d(this.moonPosition(PLANETS.jupiter.distance, this._orbitalAngles.jupiter, MOONS.jupiterCallisto.distance, this._orbitalAngles.jupiterCallisto), MOONS.jupiterCallisto.size, moonStyle);
    private _saturn = new Circle3d(this.planetPosition(PLANETS.saturn.distance, this._orbitalAngles.saturn), PLANETS.saturn.size, saturnStyle);
    private _saturnMoon1Titan = new Circle3d(this.moonPosition(PLANETS.saturn.distance, this._orbitalAngles.saturn, MOONS.saturnTitan.distance, this._orbitalAngles.saturnTitan), MOONS.saturnTitan.size, moonStyle);
    private _uranus = new Circle3d(this.planetPosition(PLANETS.uranus.distance, this._orbitalAngles.uranus), PLANETS.uranus.size, uranusStyle);
    private _uranusMoon1Titania = new Circle3d(this.moonPosition(PLANETS.uranus.distance, this._orbitalAngles.uranus, MOONS.uranusTitania.distance, this._orbitalAngles.uranusTitania), MOONS.uranusTitania.size, moonStyle);
    private _neptune = new Circle3d(this.planetPosition(PLANETS.neptune.distance, this._orbitalAngles.neptune), PLANETS.neptune.size, neptuneStyle);
    private _neptuneMoon1Triton = new Circle3d(this.moonPosition(PLANETS.neptune.distance, this._orbitalAngles.neptune, MOONS.neptuneTriton.distance, this._orbitalAngles.neptuneTriton), MOONS.neptuneTriton.size, moonStyle);

    constructor() {
        super();
        this.circles = [
            this._sun,
            this._mercury,
            this._venus,
            this._earth, this._earthMoon1,
            this._mars,
            this._jupiter, this._jupiterMoon1Io, this._jupiterMoon2Europa, this._jupiterMoon3Ganymede, this._jupiterMoon4Calisto,
            this._saturn, this._saturnMoon1Titan,
            this._uranus, this._uranusMoon1Titania,
            this._neptune, this._neptuneMoon1Triton,
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

        this._orbitalAngles.venus += PLANETS.venus.speed * speedFactor;
        this._venus.position = this.planetPosition(PLANETS.venus.distance, this._orbitalAngles.venus);

        this._orbitalAngles.earth += PLANETS.earth.speed * speedFactor;
        this._earth.position = this.planetPosition(PLANETS.earth.distance, this._orbitalAngles.earth);
        this._orbitalAngles.earthLuna += MOONS.earthLuna.speed * speedFactor;
        this._earthMoon1.position = this.moonPosition(PLANETS.earth.distance, this._orbitalAngles.earth, MOONS.earthLuna.distance, this._orbitalAngles.earthLuna);

        this._orbitalAngles.mars += PLANETS.mars.speed * speedFactor;
        this._mars.position = this.planetPosition(PLANETS.mars.distance, this._orbitalAngles.mars);

        this._orbitalAngles.jupiter += PLANETS.jupiter.speed * speedFactor;
        this._jupiter.position = this.planetPosition(PLANETS.jupiter.distance, this._orbitalAngles.jupiter);
        this._orbitalAngles.jupiterIo += MOONS.jupiterIo.speed * speedFactor;
        this._jupiterMoon1Io.position = this.moonPosition(PLANETS.jupiter.distance, this._orbitalAngles.jupiter, MOONS.jupiterIo.distance, this._orbitalAngles.jupiterIo);
        this._orbitalAngles.jupiterEuropa += MOONS.jupiterEuropa.speed * speedFactor;
        this._jupiterMoon2Europa.position = this.moonPosition(PLANETS.jupiter.distance, this._orbitalAngles.jupiter, MOONS.jupiterEuropa.distance, this._orbitalAngles.jupiterEuropa);
        this._orbitalAngles.jupiterGanymede += MOONS.jupiterGanymede.speed * speedFactor;
        this._jupiterMoon3Ganymede.position = this.moonPosition(PLANETS.jupiter.distance, this._orbitalAngles.jupiter, MOONS.jupiterGanymede.distance, this._orbitalAngles.jupiterGanymede);
        this._orbitalAngles.jupiterCallisto += MOONS.jupiterCallisto.speed * speedFactor;
        this._jupiterMoon4Calisto.position = this.moonPosition(PLANETS.jupiter.distance, this._orbitalAngles.jupiter, MOONS.jupiterCallisto.distance, this._orbitalAngles.jupiterCallisto);

        this._orbitalAngles.saturn += PLANETS.saturn.speed * speedFactor;
        this._saturn.position = this.planetPosition(PLANETS.saturn.distance, this._orbitalAngles.saturn);
        this._orbitalAngles.saturnTitan += MOONS.saturnTitan.speed * speedFactor;
        this._saturnMoon1Titan.position = this.moonPosition(PLANETS.saturn.distance, this._orbitalAngles.saturn, MOONS.saturnTitan.distance, this._orbitalAngles.saturnTitan);

        this._orbitalAngles.uranus += PLANETS.uranus.speed * speedFactor;
        this._uranus.position = this.planetPosition(PLANETS.uranus.distance, this._orbitalAngles.uranus);
        this._orbitalAngles.uranusTitania += MOONS.uranusTitania.speed * speedFactor;
        this._uranusMoon1Titania.position = this.moonPosition(PLANETS.uranus.distance, this._orbitalAngles.uranus, MOONS.uranusTitania.distance, this._orbitalAngles.uranusTitania);

        this._orbitalAngles.neptune += PLANETS.neptune.speed * speedFactor;
        this._neptune.position = this.planetPosition(PLANETS.neptune.distance, this._orbitalAngles.neptune);
        this._orbitalAngles.neptuneTriton -= MOONS.neptuneTriton.speed * speedFactor; // only one rotating clockwise
        this._neptuneMoon1Triton.position = this.moonPosition(PLANETS.neptune.distance, this._orbitalAngles.neptune, MOONS.neptuneTriton.distance, this._orbitalAngles.neptuneTriton);
    }

    private planetPosition(distance: number, angle: number): SpaceCoord {
        return {
            x: distance * Math.cos(angle * ONE_DEGREE),
            y: 0,
            z: distance * Math.sin(angle * ONE_DEGREE),
        }
    }

    private moonPosition(distance1: number, angle1: number, distance2: number, angle2: number): SpaceCoord {
        return {
            x: distance1 * Math.cos(angle1 * ONE_DEGREE) + distance2 * Math.cos(angle2 * ONE_DEGREE),
            y: 0,
            z: distance1 * Math.sin(angle1 * ONE_DEGREE) + distance2 * Math.sin(angle2 * ONE_DEGREE),
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