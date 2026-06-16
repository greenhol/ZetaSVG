import { Circle3d, CircleStyle, circleStyle } from '../types/shape/circle';
import { Vector3 } from '../types/vector-3';
import { Matrix3 } from './../types/matrix/matrix-3';

interface RGB {
    r: number;
    g: number;
    b: number;
}

interface ColoredDotProperty {
    position: Vector3;
    cssColor: string;
}

interface MainColorProperties {
    red: ColoredDotProperty;
    green: ColoredDotProperty;
    blue: ColoredDotProperty;
}

interface ColoredDotProperties {
    sRGB: MainColorProperties;
    adobeRGB: MainColorProperties;
    p3: MainColorProperties;
    rec2020: MainColorProperties;
}

export const coloredDotProperties: ColoredDotProperties = {
    sRGB: {
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

export const spectralLocus: Vector3[] = [
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

export function createCircleStyle(color: string): CircleStyle {
    return circleStyle().fill(color).stroke('none').get();
}

function xyToXYZ(pos: Vector3): Vector3 {
    return {
        x: pos.x / pos.y,
        y: 1,
        z: (1 - pos.x - pos.y) / pos.y,
    };
}

function createMatrixSRGB() {
    const retval = new Matrix3();

    retval.m[0][0] = 3.2406;
    retval.m[0][1] = -1.5372;
    retval.m[0][2] = -0.4986;

    retval.m[1][0] = -0.9689;
    retval.m[1][1] = 1.8758;
    retval.m[1][2] = 0.0415;

    retval.m[2][0] = 0.0557;
    retval.m[2][1] = -0.2040;
    retval.m[2][2] = 1.0570;

    return retval;
}

function createMatrixAdobeRGB() {
    const retval = new Matrix3();

    retval.m[0][0] = 2.0414;
    retval.m[0][1] = -0.5649;
    retval.m[0][2] = -0.3447;

    retval.m[1][0] = -0.9693;
    retval.m[1][1] = 1.8760;
    retval.m[1][2] = 0.0416;

    retval.m[2][0] = 0.0134;
    retval.m[2][1] = -0.1184;
    retval.m[2][2] = 1.0154;

    return retval;
}

function createMatrixP3() {
    const retval = new Matrix3();

    retval.m[0][0] = 2.4935;
    retval.m[0][1] = -0.9314;
    retval.m[0][2] = -0.4027;

    retval.m[1][0] = -0.8295;
    retval.m[1][1] = 1.7627;
    retval.m[1][2] = 0.0236;

    retval.m[2][0] = 0.0358;
    retval.m[2][1] = -0.0762;
    retval.m[2][2] = 0.9569;

    return retval;
}

function createMatrixRec2020() {
    const retval = new Matrix3();

    retval.m[0][0] = 1.7167;
    retval.m[0][1] = -0.3557;
    retval.m[0][2] = -0.2534;

    retval.m[1][0] = -0.6667;
    retval.m[1][1] = 1.6165;
    retval.m[1][2] = 0.0158;

    retval.m[2][0] = 0.0176;
    retval.m[2][1] = -0.0428;
    retval.m[2][2] = 0.9421;

    return retval;
}

function gammaEncode_sRGB(value: number): number {
    const v = Math.max(0, value);
    return v <= 0.0031308
        ? 12.92 * v
        : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
}

function gammaEncode_AdobeRGB(value: number): number {
    return Math.pow(Math.max(0, value), 1 / 2.19921875);
}

function gammaEncode_P3(value: number): number {
    const v = Math.max(0, value);
    return v <= 0.0031308
        ? 12.92 * v
        : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
}

function gammaEncode_Rec2020(value: number): number {
    const v = Math.max(0, value);
    const beta = 0.018053968510807;
    const alpha = 1.09929682680944;
    return v < beta
        ? 4.5 * v
        : alpha * Math.pow(v, 0.45) - (alpha - 1);
}

function clamp(v: number): number {
    return Math.max(Math.min(v, 1), 0);
}

export function createCircle3dSRGB(x: number, y: number, r: number): Circle3d {
    const xy: Vector3 = { x: x, y: y, z: 0 };
    const xyUnscaled: Vector3 = { x: x / 10, y: y / 10, z: 0 };
    const XYZ = xyToXYZ(xyUnscaled);
    const linearRGB = createMatrixSRGB().vector3Multiply(XYZ);
    const rgb: RGB = {
        r: clamp(gammaEncode_sRGB(linearRGB.x)),
        g: clamp(gammaEncode_sRGB(linearRGB.y)),
        b: clamp(gammaEncode_sRGB(linearRGB.z)),
    };
    return new Circle3d(xy, r, createCircleStyle(`rgb(${rgb.r * 255}, ${rgb.g * 255}, ${rgb.b * 255})`));
}

export function createCircle3dAdobeRGB(x: number, y: number, r: number): Circle3d {
    const xy: Vector3 = { x: x, y: y, z: 0 };
    const xyUnscaled: Vector3 = { x: x / 10, y: y / 10, z: 0 };
    const XYZ = xyToXYZ(xyUnscaled);
    const linearRGB = createMatrixAdobeRGB().vector3Multiply(XYZ);
    const rgb: RGB = {
        r: clamp(gammaEncode_AdobeRGB(linearRGB.x)),
        g: clamp(gammaEncode_AdobeRGB(linearRGB.y)),
        b: clamp(gammaEncode_AdobeRGB(linearRGB.z)),
    };
    return new Circle3d(xy, r, createCircleStyle(`color(a98-rgb ${rgb.r} ${rgb.g} ${rgb.b})`));
}

export function createCircle3dP3(x: number, y: number, r: number): Circle3d {
    const xy: Vector3 = { x: x, y: y, z: 0 };
    const xyUnscaled: Vector3 = { x: x / 10, y: y / 10, z: 0 };
    const XYZ = xyToXYZ(xyUnscaled);
    const linearRGB = createMatrixP3().vector3Multiply(XYZ);
    const rgb: RGB = {
        r: clamp(gammaEncode_P3(linearRGB.x)),
        g: clamp(gammaEncode_P3(linearRGB.y)),
        b: clamp(gammaEncode_P3(linearRGB.z)),
    };
    return new Circle3d(xy, r, createCircleStyle(`color(display-p3 ${rgb.r} ${rgb.g} ${rgb.b})`));
}

export function createCircle3dRec2020(x: number, y: number, r: number): Circle3d {
    const xy: Vector3 = { x: x, y: y, z: 0 };
    const xyUnscaled: Vector3 = { x: x / 10, y: y / 10, z: 0 };
    const XYZ = xyToXYZ(xyUnscaled);
    const linearRGB = createMatrixRec2020().vector3Multiply(XYZ);
    const rgb: RGB = {
        r: clamp(gammaEncode_Rec2020(linearRGB.x)),
        g: clamp(gammaEncode_Rec2020(linearRGB.y)),
        b: clamp(gammaEncode_Rec2020(linearRGB.z)),
    };
    return new Circle3d(xy, r, createCircleStyle(`color(rec2020 ${rgb.r} ${rgb.g} ${rgb.b})`));
}
