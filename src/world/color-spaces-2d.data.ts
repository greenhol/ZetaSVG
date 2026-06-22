import { Circle3d } from '../types/shape/circle';
import { Vector3 } from '../types/vector-3';
import { ColoredDotProperties, ColorSpacesData } from './color-spaces.data';

export class ColorSpaces2dData extends ColorSpacesData {

    public readonly spectralLocus: Vector3[] = [
        { x: 1.7556023175572397, y: 0.05293837011448581, z: 0 },
        { x: 1.7030098877973634, y: 0.05788504996470994, z: 0 },
        { x: 1.4969056475871325, y: 0.23950330195758446, z: 0 },
        { x: 1.3912068242657054, y: 0.35200572826801746, z: 0 },
        { x: 1.2908578655718694, y: 0.4944981065973488, z: 0 },
        { x: 1.0959432361561003, y: 0.8684251118309424, z: 0 },
        { x: 0.8708243172709643, y: 1.4431658268023255, z: 0 },
        { x: 0.6870592129105554, y: 2.0072321772810224, z: 0 },
        { x: 0.5003149705811968, y: 2.7400180321980216, z: 0 },
        { x: 0.31756470378920837, y: 3.6359769324634263, z: 0 },
        { x: 0.19704636302953663, y: 4.377558886520738, z: 0 },
        { x: 0.10475700683125562, y: 5.134042451602119, z: 0 },
        { x: 0.04875429992690795, y: 5.871164380446025, z: 0 },
        { x: 0.03858520900321543, y: 6.54823151125402, z: 0 },
        { x: 0.06010913071696028, y: 6.961200613362059, z: 0 },
        { x: 0.10603290554259022, y: 7.334129426515558, z: 0 },
        { x: 0.22244205694743915, y: 7.796299232007714, z: 0 },
        { x: 0.3282035752221749, y: 8.029256729896401, z: 0 },
        { x: 0.3885180240320428, y: 8.120160213618158, z: 0 },
        { x: 0.45327984829413914, y: 8.19390800456081, z: 0 },
        { x: 0.5932553335198714, y: 8.29425776296551, z: 0 },
        { x: 0.7430242477337496, y: 8.33803091340228, z: 0 },
        { x: 0.8994173958533608, y: 8.332889188959584, z: 0 },
        { x: 1.0602110733224062, y: 8.29178186631099, z: 0 },
        { x: 1.3054566813839383, y: 8.189278529094036, z: 0 },
        { x: 1.6253542465545567, y: 8.012384804136108, z: 0 },
        { x: 1.928760978777212, y: 7.81629216363077, z: 0 },
        { x: 2.5136340887073825, y: 7.366055813624448, z: 0 },
        { x: 3.0875992309265654, y: 6.857120606067403, z: 0 },
        { x: 3.8024383546406515, y: 6.175021521737047, z: 0 },
        { x: 7.3468995878331205, y: 2.6531004121668795, z: 0 },
    ];

    public override readonly d65x: number = 3.127;
    public override readonly d65y: number = 3.290;
    public override readonly d65z: number = 0;

    public override readonly dotProp: ColoredDotProperties = {
        sRGB: {
            black: { position: { x: 0, y: 0, z: 0 }, cssColor: 'rgb(0, 0, 0)' },
            white: { position: { x: 0, y: 0, z: 0 }, cssColor: 'rgb(255, 255, 255)' },
            red: {
                position: { x: 6.400, y: 3.300, z: 0 },
                cssColor: 'rgb(255, 0, 0)'
            },
            green: {
                position: { x: 3.000, y: 6.000, z: 0 },
                cssColor: 'rgb(0, 255, 0)'
            },
            blue: {
                position: { x: 1.500, y: 0.600, z: 0 },
                cssColor: 'rgb(0, 0, 255)'
            }
        },
        adobeRGB: {
            black: { position: { x: 0, y: 0, z: 0 }, cssColor: 'color(a98-rgb 0, 0, 0)' },
            white: { position: { x: 0, y: 0, z: 0 }, cssColor: 'color(a98-rgb 1, 1, 1)' },
            red: {
                position: { x: 6.400, y: 3.300, z: 0 },
                cssColor: 'color(a98-rgb 1 0 0)'
            },
            green: {
                position: { x: 2.100, y: 7.100, z: 0 },
                cssColor: 'color(a98-rgb 0 1 0)'
            },
            blue: {
                position: { x: 1.500, y: 0.600, z: 0 },
                cssColor: 'color(a98-rgb 0 0 1)'
            }
        },
        p3: {
            black: { position: { x: 0, y: 0, z: 0 }, cssColor: 'color(display-p3 0, 0, 0)' },
            white: { position: { x: 0, y: 0, z: 0 }, cssColor: 'color(display-p3 1, 1, 1)' },
            red: {
                position: { x: 6.800, y: 3.200, z: 0 },
                cssColor: 'color(display-p3 1 0 0)'
            },
            green: {
                position: { x: 2.650, y: 6.900, z: 0 },
                cssColor: 'color(display-p3 0 1 0)'
            },
            blue: {
                position: { x: 1.500, y: 0.600, z: 0 },
                cssColor: 'color(display-p3 0 0 1)'
            }
        },
        rec2020: {
            black: { position: { x: 0, y: 0, z: 0 }, cssColor: 'color(rec2020 0, 0, 0)' },
            white: { position: { x: 0, y: 0, z: 0 }, cssColor: 'color(rec2020 1, 1, 1)' },
            red: {
                position: { x: 7.080, y: 2.920, z: 0 },
                cssColor: 'color(rec2020 1 0 0)'
            },
            green: {
                position: { x: 1.700, y: 7.970, z: 0 },
                cssColor: 'color(rec2020 0 1 0)'
            },
            blue: {
                position: { x: 1.310, y: 0.460, z: 0 },
                cssColor: 'color(rec2020 0 0 1)'
            }
        }
    };

    public override createCircle3dSRGB(pos: Vector3, radius: number): Circle3d {
        const xy: Vector3 = { x: pos.x, y: pos.y, z: 0 };
        const xyUnscaled: Vector3 = { x: pos.x / 10, y: pos.y / 10, z: 0 };
        const XYZ = this.xyToXYZ(xyUnscaled);
        const linearRGB = this.matrixSRGB.vector3Multiply(XYZ);
        const rgb: number[] = [
            this.clamp(this.gammaEncode_sRGB(linearRGB.x)),
            this.clamp(this.gammaEncode_sRGB(linearRGB.y)),
            this.clamp(this.gammaEncode_sRGB(linearRGB.z)),
        ];
        return new Circle3d(xy, radius, this.createCircleStyle(`rgb(${rgb[0] * 255}, ${rgb[1] * 255}, ${rgb[2] * 255})`));
    }

    public override createCircle3dAdobeRGB(pos: Vector3, radius: number): Circle3d {
        const xy: Vector3 = { x: pos.x, y: pos.y, z: 0 };
        const xyUnscaled: Vector3 = { x: pos.x / 10, y: pos.y / 10, z: 0 };
        const XYZ = this.xyToXYZ(xyUnscaled);
        const linearRGB = this.matrixAdobeRGB.vector3Multiply(XYZ);
        const rgb: number[] = [
            this.clamp(this.gammaEncode_AdobeRGB(linearRGB.x)),
            this.clamp(this.gammaEncode_AdobeRGB(linearRGB.y)),
            this.clamp(this.gammaEncode_AdobeRGB(linearRGB.z)),
        ];
        return new Circle3d(xy, radius, this.createCircleStyle(`color(a98-rgb ${rgb[0]} ${rgb[1]} ${rgb[2]})`));
    }

    public override createCircle3dP3(pos: Vector3, radius: number): Circle3d {
        const xy: Vector3 = { x: pos.x, y: pos.y, z: 0 };
        const xyUnscaled: Vector3 = { x: pos.x / 10, y: pos.y / 10, z: 0 };
        const XYZ = this.xyToXYZ(xyUnscaled);
        const linearRGB = this.matrixP3.vector3Multiply(XYZ);
        const rgb: number[] = [
            this.clamp(this.gammaEncode_P3(linearRGB.x)),
            this.clamp(this.gammaEncode_P3(linearRGB.y)),
            this.clamp(this.gammaEncode_P3(linearRGB.z)),
        ];
        return new Circle3d(xy, radius, this.createCircleStyle(`color(display-p3 ${rgb[0]} ${rgb[1]} ${rgb[2]})`));
    }

    public override createCircle3dRec2020(pos: Vector3, radius: number): Circle3d {
        const xy: Vector3 = { x: pos.x, y: pos.y, z: 0 };
        const xyUnscaled: Vector3 = { x: pos.x / 10, y: pos.y / 10, z: 0 };
        const XYZ = this.xyToXYZ(xyUnscaled);
        const linearRGB = this.matrixRec2020.vector3Multiply(XYZ);
        const rgb: number[] = [
            this.clamp(this.gammaEncode_Rec2020(linearRGB.x)),
            this.clamp(this.gammaEncode_Rec2020(linearRGB.y)),
            this.clamp(this.gammaEncode_Rec2020(linearRGB.z)),
        ];
        return new Circle3d(xy, radius, this.createCircleStyle(`color(rec2020 ${rgb[0]} ${rgb[1]} ${rgb[2]})`));
    }

    private xyToXYZ(pos: Vector3): Vector3 {
        return {
            x: pos.x / pos.y,
            y: 1,
            z: (1 - pos.x - pos.y) / pos.y,
        };
    }
}
