import { ModuleConfig } from '../../shared/config';
import { InitializeAfterConstruct } from '../../shared/initializable';
import { ONE_DEGREE } from '../types/constants';
import { Circle3d } from '../types/shape/circle';
import { circleStyle } from '../types/shape/circle/circle-style';
import { Path3d, pathStyle } from '../types/shape/path';
import { Vector3 } from '../types/vector-3';
import { clipLine3DByLength } from '../utils/clip-line-3d';
import { CellCount, generatePolytope, PolychoronData, PolychoronType, Vector4 } from './polychoron.data';
import { CREATE } from './ui/world-config-field-creator';
import { World, WorldConfig } from './world';

interface PolychoronConfig extends WorldConfig {
    type: PolychoronType;
    wDistance: number;
    rotateSpeedX: number;
    rotateSpeedY: number;
    rotateSpeedZ: number;
}

@InitializeAfterConstruct()
export class Polychoron extends World {

    private _polychoronData: PolychoronData;

    private verticeStype = circleStyle()
        .fill('rgba(255, 222, 37, 0.8)')
        .stroke('rgb(151, 48, 0)')
        .strokeWidth(0.3)
        .get();

    private edgeStyle = pathStyle()
        .strokeWidth(0.33)
        .strokeLinecap('round')
        .stroke('rgba(218, 98, 0, 0.8)')
        .get();

    constructor() {
        super();
        let cellcount: CellCount;
        switch (this.config.data.type) {
            case PolychoronType.CELL_5: cellcount = 5; break;
            case PolychoronType.CELL_8: cellcount = 8; break;
            case PolychoronType.CELL_16: cellcount = 16; break;
            case PolychoronType.CELL_24: cellcount = 24; break;
        }
        this._polychoronData = generatePolytope(cellcount);
        console.log(`#ctor - polychoron ${this.config.data.type} vertices/edges ${this._polychoronData.vertices.length}/${this._polychoronData.edges.length}`);

        this.circles = this._polychoronData.vertices.map(vector4 => {
            return new Circle3d(this.project4to3(vector4, 0), 1.25, this.verticeStype);
        });
        this.paths = this._polychoronData.edges.map(path4 => {
            return new Path3d(this.projectLine4to3(path4.p1, path4.p2), false, false, this.edgeStyle);
        });
    }

    override config = new ModuleConfig<PolychoronConfig>(
        {
            cameraPerspective: {
                position: { x: -0, y: 0, z: -2.2 },
                angleX: 0 * ONE_DEGREE,
                angleY: 66 * ONE_DEGREE,
                angleZ: 0 * ONE_DEGREE,
                fov: 90,
                type: 'Orbit',
            },
            type: PolychoronType.CELL_8,
            wDistance: 5.5,
            rotateSpeedX: -1,
            rotateSpeedY: 0,
            rotateSpeedZ: 0,
        },
        "polychoronConfig",
        [
            CREATE.createEnumField('type', PolychoronType, 'Type', 'Type of Polychoron'),
            CREATE.createFloatField('wDistance', 'W distance', 'Distance to Camera in 4th Dimension', 4.1, 20),
            CREATE.createFloatField('rotateSpeedX', 'Rot. Speed XX', 'Rotational Speed around WX plane', -5, 5),
            CREATE.createFloatField('rotateSpeedY', 'Rot. Speed XY', 'Rotational Speed around WY plane', -5, 5),
            CREATE.createFloatField('rotateSpeedZ', 'Rot. Speed XZ', 'Rotational Speed around WZ plane', -5, 5),
        ]
    );

    override backgroundColour: string = '#fffacf';

    public transitionToStateAt(t: number): void {
        this.circles.forEach((circle, index) => {
            const pos = this._polychoronData.vertices[index];
            const posX = this.rotateXW(pos, t * Math.PI / 180 * this.config.data.rotateSpeedX);
            const posXY = this.rotateYW(posX, t * Math.PI / 180 * this.config.data.rotateSpeedY);
            const posXYZ = this.rotateZW(posXY, t * Math.PI / 180 * this.config.data.rotateSpeedZ);
            circle.position = this.project4to3(posXYZ, 0);
        });
        this.paths.forEach((path, index) => {
            const pos1 = this._polychoronData.edges[index].p1;
            const pos2 = this._polychoronData.edges[index].p2;
            const posX1 = this.rotateXW(pos1, t * Math.PI / 180 * this.config.data.rotateSpeedX);
            const posX2 = this.rotateXW(pos2, t * Math.PI / 180 * this.config.data.rotateSpeedX);
            const posXY1 = this.rotateYW(posX1, t * Math.PI / 180 * this.config.data.rotateSpeedY);
            const posXY2 = this.rotateYW(posX2, t * Math.PI / 180 * this.config.data.rotateSpeedY);
            const posXYZ1 = this.rotateZW(posXY1, t * Math.PI / 180 * this.config.data.rotateSpeedZ);
            const posXYZ2 = this.rotateZW(posXY2, t * Math.PI / 180 * this.config.data.rotateSpeedZ);
            path.path = this.projectLine4to3(posXYZ1, posXYZ2);
        });
    }

    private project4to3(v4: Vector4, wShift: number): Vector3 {
        const w = 1 / (this.config.data.wDistance - (v4.w + wShift));
        return {
            x: v4.x * w,
            y: v4.y * w,
            z: v4.z * w,
        };
    }

    private projectLine4to3(v41: Vector4, v42: Vector4): Vector3[] {
        return clipLine3DByLength(this.project4to3(v41, 0), this.project4to3(v42, 0), 0.1, 0.1);
    }

    private rotateXW(v: Vector4, angle: number): Vector4 {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return {
            x: v.x * cos - v.w * sin,
            y: v.y,
            z: v.z,
            w: v.x * sin + v.w * cos,
        };
    }

    private rotateYW(v: Vector4, angle: number): Vector4 {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return {
            x: v.x,
            y: v.y * cos - v.w * sin,
            z: v.z,
            w: v.y * sin + v.w * cos,
        };
    }

    private rotateZW(v: Vector4, angle: number): Vector4 {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return {
            x: v.x,
            y: v.y,
            z: v.z * cos - v.w * sin,
            w: v.z * sin + v.w * cos,
        };
    }
}
