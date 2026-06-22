import { Circle3d, CircleStyle, circleStyle } from '../types/shape/circle';
import { Vector3 } from '../types/vector-3';
import { Matrix3 } from './../types/matrix/matrix-3';

export interface ColoredDotProperty {
    position: Vector3;
    cssColor: string;
}

export interface MainColorProperties {
    black: ColoredDotProperty;
    white: ColoredDotProperty;
    red: ColoredDotProperty;
    green: ColoredDotProperty;
    blue: ColoredDotProperty;
}

export interface ColoredDotProperties {
    sRGB: MainColorProperties;
    adobeRGB: MainColorProperties;
    p3: MainColorProperties;
    rec2020: MainColorProperties;
}

export abstract class ColorSpacesData {

    private _matrixSRGB: Matrix3;
    private _matrixAdobeRGB: Matrix3;
    private _matrixP3: Matrix3;
    private _matrixRec2020: Matrix3;

    constructor() {
        this._matrixSRGB = new Matrix3();
        this._matrixSRGB.m[0][0] = 3.2406;
        this._matrixSRGB.m[0][1] = -1.5372;
        this._matrixSRGB.m[0][2] = -0.4986;
        this._matrixSRGB.m[1][0] = -0.9689;
        this._matrixSRGB.m[1][1] = 1.8758;
        this._matrixSRGB.m[1][2] = 0.0415;
        this._matrixSRGB.m[2][0] = 0.0557;
        this._matrixSRGB.m[2][1] = -0.2040;
        this._matrixSRGB.m[2][2] = 1.0570;

        this._matrixAdobeRGB = new Matrix3();
        this._matrixAdobeRGB.m[0][0] = 2.0414;
        this._matrixAdobeRGB.m[0][1] = -0.5649;
        this._matrixAdobeRGB.m[0][2] = -0.3447;
        this._matrixAdobeRGB.m[1][0] = -0.9693;
        this._matrixAdobeRGB.m[1][1] = 1.8760;
        this._matrixAdobeRGB.m[1][2] = 0.0416;
        this._matrixAdobeRGB.m[2][0] = 0.0134;
        this._matrixAdobeRGB.m[2][1] = -0.1184;
        this._matrixAdobeRGB.m[2][2] = 1.0154;

        this._matrixP3 = new Matrix3();
        this._matrixP3.m[0][0] = 2.4935;
        this._matrixP3.m[0][1] = -0.9314;
        this._matrixP3.m[0][2] = -0.4027;
        this._matrixP3.m[1][0] = -0.8295;
        this._matrixP3.m[1][1] = 1.7627;
        this._matrixP3.m[1][2] = 0.0236;
        this._matrixP3.m[2][0] = 0.0358;
        this._matrixP3.m[2][1] = -0.0762;
        this._matrixP3.m[2][2] = 0.9569;

        this._matrixRec2020 = new Matrix3();
        this._matrixRec2020.m[0][0] = 1.7167;
        this._matrixRec2020.m[0][1] = -0.3557;
        this._matrixRec2020.m[0][2] = -0.2534;
        this._matrixRec2020.m[1][0] = -0.6667;
        this._matrixRec2020.m[1][1] = 1.6165;
        this._matrixRec2020.m[1][2] = 0.0158;
        this._matrixRec2020.m[2][0] = 0.0176;
        this._matrixRec2020.m[2][1] = -0.0428;
        this._matrixRec2020.m[2][2] = 0.9421;
    }

    public readonly abstract d65x: number;
    public readonly abstract d65y: number;
    public readonly abstract d65z: number;

    public readonly abstract dotProp: ColoredDotProperties;

    public abstract createCircle3dSRGB(pos: Vector3, radius: number): Circle3d;
    public abstract createCircle3dAdobeRGB(pos: Vector3, radius: number): Circle3d;
    public abstract createCircle3dP3(pos: Vector3, radius: number): Circle3d;
    public abstract createCircle3dRec2020(pos: Vector3, radius: number): Circle3d;

    public get d65offset(): Vector3 {
        return { x: -this.d65x, y: -this.d65y, z: -this.d65z };
    }

    public get matrixSRGB(): Matrix3 {
        return this._matrixSRGB;
    }

    public get matrixAdobeRGB(): Matrix3 {
        return this._matrixAdobeRGB;
    }

    public get matrixP3(): Matrix3 {
        return this._matrixP3;
    }

    public get matrixRec2020(): Matrix3 {
        return this._matrixRec2020;
    }

    public gammaEncode_sRGB(value: number): number {
        const v = Math.max(0, value);
        return v <= 0.0031308
            ? 12.92 * v
            : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
    }

    public gammaEncode_AdobeRGB(value: number): number {
        return Math.pow(Math.max(0, value), 1 / 2.19921875);
    }

    public gammaEncode_P3(value: number): number {
        const v = Math.max(0, value);
        return v <= 0.0031308
            ? 12.92 * v
            : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
    }

    public gammaEncode_Rec2020(value: number): number {
        const v = Math.max(0, value);
        const beta = 0.018053968510807;
        const alpha = 1.09929682680944;
        return v < beta
            ? 4.5 * v
            : alpha * Math.pow(v, 0.45) - (alpha - 1);
    }

    public clamp(v: number): number {
        return Math.max(Math.min(v, 1), 0);
    }

    public createCircleStyle(color: string): CircleStyle {
        return circleStyle().fill(color).stroke('none').get();
    }
}
