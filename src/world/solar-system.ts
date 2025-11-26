import { ModuleConfig } from '../config/module-config';
import { ONE_DEGREE } from '../types/constants';
import { Circle3d } from '../types/shape/circle';
import { createOrigin, SpaceCoord } from '../types/space-coord';
import { earthStyle, jupiterStyle, marsStyle, mercuryStyle, moonStyle, neptuneStyle, saturnStyle, sunStyle, uranusStyle, venusStyle } from './solar-system-styles';
import { World, WorldConfig } from './world';

export class SolarSystem extends World {

    private _sun = new Circle3d(createOrigin(), 15, sunStyle);

    private _mercuryDistance = 2;
    private _mercuryAngle = 0 * ONE_DEGREE;
    private _mercury = new Circle3d(this.planetPosition(this._mercuryDistance, this._mercuryAngle), 0.35, mercuryStyle);

    private _venusDistance = 2.5;
    private _venusAngle = 257 * ONE_DEGREE;
    private _venus = new Circle3d(this.planetPosition(this._venusDistance, this._venusAngle), 0.88, venusStyle);

    private _earthDistance = 2.85;
    private _earthAngle = 267 * ONE_DEGREE;
    private _earth = new Circle3d(this.planetPosition(this._earthDistance, this._earthAngle), 0.92, earthStyle);
    private _earthMoon1Distance = 0.1;
    private _earthMoon1Angle = Math.random() * 360 * ONE_DEGREE;
    private _earthMoon1 = new Circle3d(this.moonPosition(this._earthDistance, this._earthAngle, this._earthMoon1Distance, this._earthMoon1Angle), 0.3, moonStyle);

    private _marsDistance = 3.3;
    private _marsAngle = 163 * ONE_DEGREE;
    private _mars = new Circle3d(this.planetPosition(this._marsDistance, this._marsAngle), 0.49, marsStyle);

    private _jupiterDistance = 4.5;
    private _jupiterAngle = 160 * ONE_DEGREE;
    private _jupiter = new Circle3d(this.planetPosition(this._jupiterDistance, this._jupiterAngle), 10.5, jupiterStyle);
    private _jupiterMoon1IoDistance = 1.1;
    private _jupiterMoon1IoAngle = Math.random() * 360 * ONE_DEGREE;
    private _jupiterMoon1Io = new Circle3d(this.moonPosition(this._jupiterDistance, this._jupiterAngle, this._jupiterMoon1IoDistance, this._jupiterMoon1IoAngle), 0.312, moonStyle);
    private _jupiterMoon2EuropaDistance = 1.15;
    private _jupiterMoon2EuropaAngle = Math.random() * 360 * ONE_DEGREE;
    private _jupiterMoon2Europa = new Circle3d(this.moonPosition(this._jupiterDistance, this._jupiterAngle, this._jupiterMoon2EuropaDistance, this._jupiterMoon2EuropaAngle), 0.27, moonStyle);
    private _jupiterMoon3GanymedeDistance = 1.15;
    private _jupiterMoon3GanymedeAngle = Math.random() * 360 * ONE_DEGREE;
    private _jupiterMoon3Ganymede = new Circle3d(this.moonPosition(this._jupiterDistance, this._jupiterAngle, this._jupiterMoon3GanymedeDistance, this._jupiterMoon3GanymedeAngle), 0.45, moonStyle);
    private _jupiterMoon4CalistoDistance = 1.2;
    private _jupiterMoon4CalistoAngle = Math.random() * 360 * ONE_DEGREE;
    private _jupiterMoon4Calisto = new Circle3d(this.moonPosition(this._jupiterDistance, this._jupiterAngle, this._jupiterMoon4CalistoDistance, this._jupiterMoon4CalistoAngle), 0.414, moonStyle);

    private _saturnDistance = 6;
    private _saturnAngle = 176 * ONE_DEGREE;
    private _saturn = new Circle3d(this.planetPosition(this._saturnDistance, this._saturnAngle), 8.86, saturnStyle);
    private _saturnMoon1TitanDistance = 0.9;
    private _saturnMoon1TitanAngle = Math.random() * 360 * ONE_DEGREE;
    private _saturnMoon1Titan = new Circle3d(this.moonPosition(this._saturnDistance, this._saturnAngle, this._saturnMoon1TitanDistance, this._saturnMoon1TitanAngle), 0.441, moonStyle);

    private _uranusDistance = 7.2;
    private _uranusAngle = 234 * ONE_DEGREE;
    private _uranus = new Circle3d(this.planetPosition(this._uranusDistance, this._uranusAngle), 3.76, uranusStyle);
    private _uranusMoon1TitaniaDistance = 0.4;
    private _uranusMoon1TitaniaAngle = Math.random() * 360 * ONE_DEGREE;
    private _uranusMoon1Titania = new Circle3d(this.moonPosition(this._uranusDistance, this._uranusAngle, this._uranusMoon1TitaniaDistance, this._uranusMoon1TitaniaAngle), 0.135, moonStyle);

    private _neptuneDistance = 7.965;
    private _neptuneAngle = 260 * ONE_DEGREE;
    private _neptune = new Circle3d(this.planetPosition(this._neptuneDistance, this._neptuneAngle), 3.65, neptuneStyle);
    private _neptuneMoon1TritonDistance = 0.4;
    private _neptuneMoon1TritonAngle = Math.random() * 360 * ONE_DEGREE;
    private _neptuneMoon1Triton = new Circle3d(this.moonPosition(this._neptuneDistance, this._neptuneAngle, this._neptuneMoon1TritonDistance, this._neptuneMoon1TritonAngle), 0.234, moonStyle);

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

    override config = new ModuleConfig<WorldConfig>(
        {
            cameraPerspective: {
                position: { x: 0, y: -1, z: -10 },
                angleX: 35 * ONE_DEGREE,
                angleY: 330 * ONE_DEGREE,
                angleZ: 0 * ONE_DEGREE,
            },
        },
        "solarSystemConfig",
    );

    override backgroundColor = '#000';

    public name: string = "SolarSystem";

    override transitionToStateAt(t: number): void {
        this._mercuryAngle += 0.01;
        this._mercury.position = this.planetPosition(this._mercuryDistance, this._mercuryAngle);

        this._venusAngle += 0.0038;
        this._venus.position = this.planetPosition(this._venusDistance, this._venusAngle);

        this._earthAngle += 0.0024;
        this._earth.position = this.planetPosition(this._earthDistance, this._earthAngle);
        this._earthMoon1Angle += 0.037;
        this._earthMoon1.position = this.moonPosition(this._earthDistance, this._earthAngle, this._earthMoon1Distance, this._earthMoon1Angle);

        this._marsAngle += 0.0013;
        this._mars.position = this.planetPosition(this._marsDistance, this._marsAngle);

        this._jupiterAngle += 0.0002;
        this._jupiter.position = this.planetPosition(this._jupiterDistance, this._jupiterAngle);
        this._jupiterMoon1IoAngle += 0.025;
        this._jupiterMoon1Io.position = this.moonPosition(this._jupiterDistance, this._jupiterAngle, this._jupiterMoon1IoDistance, this._jupiterMoon1IoAngle);
        this._jupiterMoon2EuropaAngle += 0.012;
        this._jupiterMoon2Europa.position = this.moonPosition(this._jupiterDistance, this._jupiterAngle, this._jupiterMoon2EuropaDistance, this._jupiterMoon2EuropaAngle);
        this._jupiterMoon3GanymedeAngle += 0.006;
        this._jupiterMoon3Ganymede.position = this.moonPosition(this._jupiterDistance, this._jupiterAngle, this._jupiterMoon3GanymedeDistance, this._jupiterMoon3GanymedeAngle);
        this._jupiterMoon4CalistoAngle += 0.003;
        this._jupiterMoon4Calisto.position = this.moonPosition(this._jupiterDistance, this._jupiterAngle, this._jupiterMoon4CalistoDistance, this._jupiterMoon4CalistoAngle);

        this._saturnAngle += 0.0001;
        this._saturn.position = this.planetPosition(this._saturnDistance, this._saturnAngle);
        this._saturnMoon1TitanAngle += 0.002;
        this._saturnMoon1Titan.position = this.moonPosition(this._saturnDistance, this._saturnAngle, this._saturnMoon1TitanDistance, this._saturnMoon1TitanAngle);

        this._uranusAngle += 0.00004;
        this._uranus.position = this.planetPosition(this._uranusDistance, this._uranusAngle);
        this._uranusMoon1TitaniaAngle += 0.001;
        this._uranusMoon1Titania.position = this.moonPosition(this._uranusDistance, this._uranusAngle, this._uranusMoon1TitaniaDistance, this._uranusMoon1TitaniaAngle);

        this._neptuneAngle += 0.00002;
        this._neptune.position = this.planetPosition(this._neptuneDistance, this._neptuneAngle);
        this._neptuneMoon1TritonAngle -= 0.0015; // only one rotating clockwise
        this._neptuneMoon1Triton.position = this.moonPosition(this._neptuneDistance, this._neptuneAngle, this._neptuneMoon1TritonDistance, this._neptuneMoon1TritonAngle);
    }

    private planetPosition(distance: number, angle: number): SpaceCoord {
        return {
            x: distance * Math.cos(angle),
            y: 0,
            z: distance * Math.sin(angle),
        }
    }

    private moonPosition(distance1: number, angle1: number, distance2: number, angle2: number): SpaceCoord {
        return {
            x: distance1 * Math.cos(angle1) + distance2 * Math.cos(angle2),
            y: 0,
            z: distance1 * Math.sin(angle1) + distance2 * Math.sin(angle2),
        }
    }
}