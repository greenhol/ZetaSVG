import { ModuleConfig } from '../config/module-config';
import { ONE_DEGREE } from '../types/constants';
import { Path3d, pathStyle } from '../types/shape/path';
import { createOrigin } from '../types/vector-3';
import { AnchorAxisOrder, HilbertCurveCalc, HilbertPoint } from './hilbert-curve.calc';
import { World, WorldConfig } from './world';

export class HilbertCurve extends World {

    private hilbert: HilbertCurveCalc;
    private cnt: number = 0;
    private maxCnt: number = 4096 - 1;

    private minZ = -3;
    private maxZ = -15;

    private _pathStyle = pathStyle()
        .strokeWidth(1)
        .stroke('#77a')
        .strokeOpacity(1)
        .get();

    public constructor() {
        super();

        this.hilbert = new HilbertCurveCalc(1, AnchorAxisOrder.XYZ);
        this.paths = [new Path3d([createOrigin()], false, true, this._pathStyle)];
        this.init();
    }

    override config = new ModuleConfig<WorldConfig>(
        {
            cameraPerspective: {
                position: { x: -1, y: 4.7, z: -5 },
                angleX: 25 * ONE_DEGREE,
                angleY: 50 * ONE_DEGREE,
                angleZ: 0,
            },
        },
        "hilbertCurveConfig",
    );

    public name: string = "Hilbert Curve";

    public transitionToStateAt(t: number): void {
        if (this.cnt > this.maxCnt) return;

        // let cntInc: number = 1 + Math.round(this.cnt / 100);
        let cntInc: number = 1;

        const scale = 0.5;
        let point: HilbertPoint;
        for (let i = 0; i < cntInc; i++) {
            point = this.hilbert.xyz(this.cnt++);
            this.paths[0].path.push({
                x: point.x * scale,
                y: point.y * scale,
                z: point.z * scale
            });
            if (this.cnt > this.maxCnt) return;
        }
    }
}
