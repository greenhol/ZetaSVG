// CIE 1931 2-degree color matching functions, pre-multiplied with the D65 illuminant
// and normalized so that the sum of Y_WEIGHTS equals 100 (380nm to 780nm, 5nm steps, 81 values).
// (Generated Code)
import { Circle3d } from '../types/shape/circle';
import { Vector3 } from '../types/vector-3';
import { ColoredDotProperties, ColorSpacesData } from './color-spaces.data';

export class ColorSpaces3dData extends ColorSpacesData {

    private readonly _cumX: number[] = [0];
    private readonly _cumY: number[] = [0];
    private readonly _cumZ: number[] = [0];

    private readonly waveLengthCnt: number = 81;
    private readonly WHITE_XYZ: Vector3;

    constructor() {
        super();

        const xWeights: number[] = [
            0.003235, 0.005535, 0.010971, 0.024868, 0.056033, 0.095593, 0.188344, 0.339614, 0.594068,
            0.915162, 1.164402, 1.488635, 1.728089, 1.826979, 1.861317, 1.770493, 1.621030, 1.382190,
            1.061733, 0.775848, 0.524585, 0.308105, 0.164803, 0.075871, 0.025353, 0.012330, 0.047437,
            0.146358, 0.313707, 0.550936, 0.843289, 1.132748, 1.434580, 1.773860, 2.133887, 2.471824,
            2.814349, 3.151075, 3.473757, 3.829345, 4.152941, 4.270871, 4.306599, 4.467179, 4.523616,
            4.442848, 4.250484, 3.936120, 3.545576, 3.039568, 2.531618, 2.140824, 1.773819, 1.397530,
            1.073484, 0.829088, 0.625866, 0.465921, 0.340252, 0.241589, 0.173240, 0.115199, 0.074886,
            0.052962, 0.038487, 0.028008, 0.020369, 0.013216, 0.008450, 0.006374, 0.004762, 0.003430,
            0.002451, 0.001562, 0.000999, 0.000612, 0.000365, 0.000313, 0.000262, 0.000182, 0.000126,
        ];

        const yWeights: number[] = [
            0.000092, 0.000158, 0.000310, 0.000705, 0.001551, 0.002638, 0.005238, 0.009537, 0.017683,
            0.031106, 0.047577, 0.076312, 0.114121, 0.156421, 0.210381, 0.266657, 0.334463, 0.406786,
            0.494454, 0.614782, 0.762525, 0.900125, 1.070989, 1.334715, 1.671261, 2.092489, 2.565676,
            3.058936, 3.520345, 3.987252, 4.392235, 4.590450, 4.712775, 4.834348, 4.898168, 4.827309,
            4.707931, 4.545464, 4.339348, 4.160691, 3.943096, 3.562550, 3.176552, 2.937676, 2.687254,
            2.408384, 2.132449, 1.850614, 1.580975, 1.298511, 1.044332, 0.857278, 0.693053, 0.535307,
            0.405160, 0.309344, 0.231521, 0.171376, 0.124578, 0.088127, 0.062969, 0.041738, 0.027084,
            0.019135, 0.013899, 0.010114, 0.007356, 0.004773, 0.003052, 0.002302, 0.001719, 0.001238,
            0.000885, 0.000564, 0.000361, 0.000221, 0.000132, 0.000113, 0.000095, 0.000065, 0.000045,
        ];

        const zWeights: number[] = [
            0.015252, 0.026113, 0.051844, 0.117707, 0.265675, 0.454264, 0.897781, 1.624354, 2.854074,
            4.427524, 5.682969, 7.354627, 8.668529, 9.356931, 9.810999, 9.689101, 9.304754, 8.411490,
            6.998002, 5.688644, 4.459031, 3.276178, 2.394974, 1.823491, 1.407377, 1.090684, 0.806938,
            0.561794, 0.387982, 0.287784, 0.214822, 0.149728, 0.100282, 0.066082, 0.043077, 0.027757,
            0.018453, 0.012773, 0.009572, 0.008181, 0.007478, 0.006110, 0.004616, 0.004227, 0.003407,
            0.002549, 0.001441, 0.001007, 0.000788, 0.000405, 0.000197, 0.000119, 0.000079, 0.000039,
            0.000000, 0.000000, 0.000000, 0.000000, 0.000000, 0.000000, 0.000000, 0.000000, 0.000000,
            0.000000, 0.000000, 0.000000, 0.000000, 0.000000, 0.000000, 0.000000, 0.000000, 0.000000,
            0.000000, 0.000000, 0.000000, 0.000000, 0.000000, 0.000000, 0.000000, 0.000000, 0.000000,
        ];


        // Cumulative sums (length N+1) so the integral over any wavelength range is a single subtraction.
        // cumX[i] = sum of X_WEIGHTS[0..i-1]. cumX[0] = 0.
        for (let i = 0; i < this.waveLengthCnt; i++) {
            this._cumX.push(this._cumX[i] + xWeights[i]);
            this._cumY.push(this._cumY[i] + yWeights[i]);
            this._cumZ.push(this._cumZ[i] + zWeights[i]);
        }
        this.WHITE_XYZ = { x: this._cumX[this.waveLengthCnt], y: this._cumY[this.waveLengthCnt], z: this._cumZ[this.waveLengthCnt] };
    }

    public override readonly d65x: number = 4.752;
    public override readonly d65y: number = 5;
    public override readonly d65z: number = 5.444;

    public override readonly dotProp: ColoredDotProperties = {
        sRGB: {
            black: {
                position: { x: 0, y: 0, z: 0 },
                cssColor: 'rgb(0, 0, 0)'
            },
            white: {
                position: { x: 9.504, y: 10, z: 10.888 },
                cssColor: 'rgb(255, 255, 255)'
            },
            red: {
                position: { x: 4.1232, y: 2.1260, z: 0.1933 },
                cssColor: 'rgb(255, 0, 0)'
            },
            green: {
                position: { x: 3.5760, y: 7.1520, z: 1.1920 },
                cssColor: 'rgb(0, 255, 0)'
            },
            blue: {
                position: { x: 1.8050, y: 0.7220, z: 9.5063 },
                cssColor: 'rgb(0, 0, 255)'
            }
        },
        adobeRGB: {
            black: {
                position: { x: 0, y: 0, z: 0 },
                cssColor: 'color(a98-rgb 0 0 0)'
            },
            white: {
                position: { x: 9.504, y: 10, z: 10.888 },
                cssColor: 'color(a98-rgb 1 1 1)'
            },
            red: {
                position: { x: 5.7670, y: 2.9736, z: 0.2703 },
                cssColor: 'color(a98-rgb 1 0 0)'
            },
            green: {
                position: { x: 1.8556, y: 6.2736, z: 0.7069 },
                cssColor: 'color(a98-rgb 0 1 0)'
            },
            blue: {
                position: { x: 1.8821, y: 0.7529, z: 9.9125 },
                cssColor: 'color(a98-rgb 0 0 1)'
            }
        },
        p3: {
            black: {
                position: { x: 0, y: 0, z: 0 },
                cssColor: 'color(display-p3 0 0 0)'
            },
            white: {
                position: { x: 9.504, y: 10, z: 10.888 },
                cssColor: 'color(display-p3 1 1 1)'
            },
            red: {
                position: { x: 4.8657, y: 2.2897, z: 0 },
                cssColor: 'color(display-p3 1 0 0)'
            },
            green: {
                position: { x: 2.6567, y: 6.9174, z: 0.4511 },
                cssColor: 'color(display-p3 0 1 0)'
            },
            blue: {
                position: { x: 1.9822, y: 0.7929, z: 10.4394 },
                cssColor: 'color(display-p3 0 0 1)'
            }
        },
        rec2020: {
            black: {
                position: { x: 0, y: 0, z: 0 },
                cssColor: 'color(rec2020 0 0 0)'
            },
            white: {
                position: { x: 9.504, y: 10, z: 10.888 },
                cssColor: 'color(rec2020 1 1 1)'
            },
            red: {
                position: { x: 6.3696, y: 2.6270, z: 0 },
                cssColor: 'color(rec2020 1 0 0)'
            },
            green: {
                position: { x: 1.4462, y: 6.7800, z: 0.2807 },
                cssColor: 'color(rec2020 0 1 0)'
            },
            blue: {
                position: { x: 1.6888, y: 0.5930, z: 10.6095 },
                cssColor: 'color(rec2020 0 0 1)'
            }
        }
    };

    public whiteAxis: Vector3[] = [
        { x: 0, y: 0, z: 0 }, // black
        { x: 9.504, y: 10, z: 10.888 }, // white (Y=100, scaled by 0.1)
    ];

    /**
    * Slices the Rösch-MacAdam solid into horizontal closed-loop boundaries at evenly
    * spaced luminance levels, suitable for rendering as a wireframe "skeleton".
    *
    * @param start first loop line offset
    * @param step The Y spacing between loop lines (e.g. 10 means lines at Y=10, Y=20, ...)
    * @param resolution Number of boundary points per loop
    */
    public generateMacAdamSkeleton(start: number, step: number, resolution: number): Vector3[][] {
        if (Number.isNaN(step)) return [];

        const skeleton: Vector3[][] = [];

        for (let targetY = start; targetY < 100; targetY += step) {
            const loop = this.computeOptimalColorBoundary(targetY, resolution, 360);
            if (loop.length > 0) {
                skeleton.push(loop);
            }
        }

        return skeleton.map((path) => {
            return path.map((point) => {
                return Vector3.scalarMultiply(0.1, point);
            });
        });
    }

    override createCircle3dSRGB(pos: Vector3, offset: Vector3, radius: number): Circle3d {
        const posUnscaled: Vector3 = { x: pos.x / 10, y: pos.y / 10, z: pos.z / 10 };
        const linearRGB = this.matrixSRGB.vector3Multiply(posUnscaled);
        const rgb: number[] = [
            this.clamp(this.gammaEncode_sRGB(linearRGB.x)),
            this.clamp(this.gammaEncode_sRGB(linearRGB.y)),
            this.clamp(this.gammaEncode_sRGB(linearRGB.z)),
        ];
        return new Circle3d(Vector3.add(pos, offset), radius, this.createCircleStyle(`rgb(${rgb[0] * 255}, ${rgb[1] * 255}, ${rgb[2] * 255})`));
    }

    override createCircle3dAdobeRGB(pos: Vector3, offset: Vector3, radius: number): Circle3d {
        const posUnscaled: Vector3 = { x: pos.x / 10, y: pos.y / 10, z: pos.z / 10 };
        const linearRGB = this.matrixAdobeRGB.vector3Multiply(posUnscaled);
        const rgb: number[] = [
            this.clamp(this.gammaEncode_AdobeRGB(linearRGB.x)),
            this.clamp(this.gammaEncode_AdobeRGB(linearRGB.y)),
            this.clamp(this.gammaEncode_AdobeRGB(linearRGB.z)),
        ];
        return new Circle3d(Vector3.add(pos, offset), radius, this.createCircleStyle(`color(a98-rgb ${rgb[0]} ${rgb[1]} ${rgb[2]})`));
    }

    override createCircle3dP3(pos: Vector3, offset: Vector3, radius: number): Circle3d {
        const posUnscaled: Vector3 = { x: pos.x / 10, y: pos.y / 10, z: pos.z / 10 };
        const linearRGB = this.matrixP3.vector3Multiply(posUnscaled);
        const rgb: number[] = [
            this.clamp(this.gammaEncode_P3(linearRGB.x)),
            this.clamp(this.gammaEncode_P3(linearRGB.y)),
            this.clamp(this.gammaEncode_P3(linearRGB.z)),
        ];
        return new Circle3d(Vector3.add(pos, offset), radius, this.createCircleStyle(`color(a98-rgb ${rgb[0]} ${rgb[1]} ${rgb[2]})`));
    }

    override createCircle3dRec2020(pos: Vector3, offset: Vector3, radius: number): Circle3d {
        const posUnscaled: Vector3 = { x: pos.x / 10, y: pos.y / 10, z: pos.z / 10 };
        const linearRGB = this.matrixRec2020.vector3Multiply(posUnscaled);
        const rgb: number[] = [
            this.clamp(this.gammaEncode_Rec2020(linearRGB.x)),
            this.clamp(this.gammaEncode_Rec2020(linearRGB.y)),
            this.clamp(this.gammaEncode_Rec2020(linearRGB.z)),
        ];
        return new Circle3d(Vector3.add(pos, offset), radius, this.createCircleStyle(`color(rec2020 ${rgb[0]} ${rgb[1]} ${rgb[2]})`));
    }

    /** Linear interpolation into the cumulative-sum table at a continuous wavelength index t in [0, N]. */
    private cumAt(t: number, cum: number[]): number {
        if (t <= 0) return cum[0];
        if (t >= this.waveLengthCnt) return cum[this.waveLengthCnt];
        const i = Math.floor(t);
        const frac = t - i;
        return cum[i] + frac * (cum[i + 1] - cum[i]);
    }

    /**
     * XYZ of the "optimal color" band-pass spectrum that is 1 between continuous wavelength
     * indices t1 and t2 (wrapping around if t1 > t2), and 0 elsewhere.
     * t1, t2 are continuous indices into WAVELENGTHS, i.e. in [0, N).
     */
    private bandPassXYZ(t1: number, t2: number): Vector3 {
        if (t1 <= t2) {
            return {
                x: this.cumAt(t2, this._cumX) - this.cumAt(t1, this._cumX),
                y: this.cumAt(t2, this._cumY) - this.cumAt(t1, this._cumY),
                z: this.cumAt(t2, this._cumZ) - this.cumAt(t1, this._cumZ),
            };
        }
        // Wraps around 780nm back to 380nm
        return {
            x: (this.WHITE_XYZ.x - this.cumAt(t1, this._cumX)) + this.cumAt(t2, this._cumX),
            y: (this.WHITE_XYZ.y - this.cumAt(t1, this._cumY)) + this.cumAt(t2, this._cumY),
            z: (this.WHITE_XYZ.z - this.cumAt(t1, this._cumZ)) + this.cumAt(t2, this._cumZ),
        };
    }

    /**
     * For a fixed start wavelength t1, grows the band-pass window forward (t2 sweeping
     * from t1 up to t1 + N, i.e. one full revolution) and finds the point where the
     * resulting luminance Y first reaches targetY. This traces exactly one point of the
     * optimal-color boundary per t1 — band-pass colors cover the boundary for the
     * "additive" side, and calling this with t1 swept across the full circle, combined
     * with the complementary band-stop side (see findBoundaryPoint), covers the full loop.
     */
    private sweepForTargetY(t1: number, targetY: number, searchSteps: number): Vector3 | null {
        let prevT2 = t1;
        let prevY = 0;

        for (let k = 1; k <= searchSteps; k++) {
            const t2Unwrapped = t1 + (k * this.waveLengthCnt) / searchSteps;
            const t2 = t2Unwrapped % this.waveLengthCnt;
            const point = this.bandPassXYZ(t1, t2);

            const crossed = (prevY <= targetY && targetY <= point.y) || (point.y <= targetY && targetY <= prevY);
            if (crossed && point.y !== prevY) {
                const frac = (targetY - prevY) / (point.y - prevY);
                const t2Interp = (prevT2 + frac * (t2Unwrapped - prevT2)) % this.waveLengthCnt;
                return this.bandPassXYZ(t1, t2Interp);
            }

            prevT2 = t2Unwrapped;
            prevY = point.y;
        }
        return null;
    }

    /**
     * Computes the exact boundary of the Rösch-MacAdam optimal color solid at a given
     * luminance (targetY in [0, 100]), as a closed-loop array of XYZ points.
     *
     * @param targetY Luminance level (CIE Y, 0-100)
     * @param resolution Number of boundary points to generate (higher = smoother loop)
     * @param searchSteps Internal sweep resolution per point (higher = more precise crossing)
     */
    private computeOptimalColorBoundary(targetY: number, resolution: number, searchSteps: number): Vector3[] {
        if (targetY <= 0 || targetY >= 100) return [];

        const points: Vector3[] = [];
        for (let k = 0; k < resolution; k++) {
            const t1 = (k * this.waveLengthCnt) / resolution;
            const point = this.sweepForTargetY(t1, targetY, searchSteps);
            if (point) points.push(point);
        }

        // Close the loop
        if (points.length > 0) {
            points.push({ ...points[0] });
        }

        return points;
    }
}
