import { AxisEnum } from '../../axis-enum';
import { ONE_DEGREE } from '../../constants';
import { IdentityMatrix3, Matrix3, RotaryMatrix3 } from '../../matrix/matrix-3';
import { addSpaceCoords, SpaceCoord } from '../../space-coord';
import { Shape3d } from '../shape3d';
import { createDefaultStyle, Rectangle3dAttributes, RectangleStyle } from './attributes';

export interface RectangleOrientation {
    rotateX: number;
    rotateY: number;
    rotateZ: number;
}

export class Rectangle3d extends Shape3d<Rectangle3dAttributes> {
    private _position: SpaceCoord;
    private _width: number;
    private _height: number;
    private _rotateX: number;
    private _rotateY: number;
    private _rotateZ: number;
    private _path: SpaceCoord[];
    private _style: RectangleStyle;

    constructor(
        position: SpaceCoord,
        width: number,
        height: number,
        orientation: RectangleOrientation = { rotateX: 0, rotateY: 0, rotateZ: 0 },
        style: RectangleStyle = createDefaultStyle(),
    ) {
        super();
        this._position = position;
        this._width = width;
        this._height = height;
        this._rotateX = orientation.rotateX * ONE_DEGREE;
        this._rotateY = orientation.rotateY * ONE_DEGREE;
        this._rotateZ = orientation.rotateZ * ONE_DEGREE;
        this._style = style;

        this.evaluatePath();
    }

    public set position(position: SpaceCoord) {
        this._position = position;
        this.evaluatePath();
    }

    public set width(width: number) {
        this._width = width;
        this.evaluatePath();
    }

    public set height(height: number) {
        this._height = height;
        this.evaluatePath();
    }

    public get orientation(): RectangleOrientation {
        return {
            rotateX: this._rotateX / ONE_DEGREE,
            rotateY: this._rotateY / ONE_DEGREE,
            rotateZ: this._rotateZ / ONE_DEGREE,
        }
    }

    public set orientation(orientation: RectangleOrientation) {
        this._rotateX = orientation.rotateX * ONE_DEGREE;
        this._rotateY = orientation.rotateY * ONE_DEGREE;
        this._rotateZ = orientation.rotateZ * ONE_DEGREE;
        this.evaluatePath();
    }

    public set style(style: RectangleStyle) {
        this._style = style;
    }

    public get attributes(): Rectangle3dAttributes {
        return {
            path: structuredClone(this._path),
            style: structuredClone(this._style),
        }
    }

    private evaluatePath() {
        const rxMatrix = new RotaryMatrix3(AxisEnum.X, this._rotateX);
        const ryMatrix = new RotaryMatrix3(AxisEnum.Y, this._rotateY);
        const rzMatrix = new RotaryMatrix3(AxisEnum.Z, this._rotateZ);

        let transformationMatrix = new IdentityMatrix3();
        transformationMatrix = Matrix3.multiply(transformationMatrix, rzMatrix);
        transformationMatrix = Matrix3.multiply(transformationMatrix, ryMatrix);
        transformationMatrix = Matrix3.multiply(transformationMatrix, rxMatrix);

        const wh = this._width / 2;
        const hh = this._height / 2;
        const corners: SpaceCoord[] = [
            { x: -wh, y: hh, z: 0 },
            { x: wh, y: hh, z: 0 },
            { x: wh, y: -hh, z: 0 },
            { x: -wh, y: -hh, z: 0 },
        ];

        this._path = corners.map((coord: SpaceCoord): SpaceCoord => {
            return addSpaceCoords(transformationMatrix.vectorMultiply(coord), this._position);
        });
    }
}
