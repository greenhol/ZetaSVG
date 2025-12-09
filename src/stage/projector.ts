import { combineLatest, sampleTime, take } from 'rxjs';
import { AxisEnum } from '../types/axis-enum';
import { IdentityMatrix4, Matrix4, RotaryMatrix4, TranslateMatrix4 } from '../types/matrix/matrix-4';
import { Circle, Circle3dAttributes } from '../types/shape/circle';
import { Path, Path3dAttributes } from '../types/shape/path';
import { Rectangle, Rectangle3dAttributes } from '../types/shape/rectangle';
import { Shapes } from '../types/shape/shapes';
import { Text, Text3dAttributes } from '../types/shape/text';
import { Vector3 } from '../types/vector-3';
import { World, WorldState } from '../world/world';
import { Camera } from './camera';

interface PlaneCoord {
    x: number;
    y: number;
}

interface PixelCoord {
    left: number;
    top: number;
}

interface ProjectedCircle extends Circle3dAttributes {
    pixel: PixelCoord;
    dist: number;
}

interface ProjectedPath extends Path3dAttributes {
    d: string;
    dist: number;
}

interface ProjectedRectangle extends Rectangle3dAttributes {
    d: string;
    dist: number;
}

interface ProjectedText extends Text3dAttributes {
    pixel: PixelCoord;
    dist: number;
}

interface ProjectedData {
    circles: ProjectedCircle[];
    paths: ProjectedPath[];
    rectangles: ProjectedRectangle[];
    texts: ProjectedText[];
}

export class Projector {
    private _stageWidthHalf: number;
    private _stageHeightHalf: number;
    private _stageRatioInverted: number;
    private _stageNear: number;
    private _stageFar: number;
    private _elementStageSizeFactor: number;

    private _world: World;
    private _camera: Camera;
    private _shapes: Shapes;

    constructor(world: World, camera: Camera, widh: number, height: number) {
        this._stageWidthHalf = widh / 2;
        this._stageHeightHalf = height / 2;
        this._stageRatioInverted = height / widh;
        this._stageNear = 1;
        this._stageFar = 30;
        this._elementStageSizeFactor = widh / 1280; // 1280 is default width for reference

        this._world = world;
        this._camera = camera;

        this._world.state$.pipe(take(1)).subscribe(state => {
            this.createShapes(this.createData(state));
        });
        // ToDo: problematic? What if this one overtakes createShapes?!?
        combineLatest([this._world.state$, this._camera.state$])
            .pipe(sampleTime(40)) // default world tick
            .subscribe(states => {
                this.updateShapes(this.createData(states[0]));
            });
    }

    public get shapes(): Shapes {
        return this._shapes;
    }

    private createData(worldState: WorldState): ProjectedData {

        const rxMatrix = new RotaryMatrix4(AxisEnum.X, this._camera.angleX);
        const ryMatrix = new RotaryMatrix4(AxisEnum.Y, this._camera.angleY);
        const rzMatrix = new RotaryMatrix4(AxisEnum.Z, this._camera.angleZ);
        const tMatrix = new TranslateMatrix4(this._camera.position);

        let transformationMatrix = new IdentityMatrix4();
        transformationMatrix = Matrix4.multiply(transformationMatrix, rzMatrix);
        transformationMatrix = Matrix4.multiply(transformationMatrix, ryMatrix);
        transformationMatrix = Matrix4.multiply(transformationMatrix, rxMatrix);
        transformationMatrix = Matrix4.multiply(transformationMatrix, tMatrix);
        transformationMatrix = transformationMatrix.inv!;

        // Circles
        let projectedCircles: ProjectedCircle[] = worldState.circles.map((circle: Circle3dAttributes): ProjectedCircle => {
            let v = transformationMatrix.vector3Multiply(circle.position);
            return {
                pixel: this.spaceToPixel(v),
                dist: this.distanceToCamera(v),
                position: {
                    x: circle.position.x,
                    y: circle.position.y,
                    z: circle.position.z,
                },
                radius: circle.radius,
                style: circle.style,
            }
        });

        // Paths
        let projectedPaths: ProjectedPath[] = worldState.paths.map((path: Path3dAttributes): ProjectedPath => {
            let point = this.spaceToPixel(transformationMatrix.vector3Multiply(path.path[0]));
            let minDist = this.distanceToCamera(transformationMatrix.vector3Multiply(path.path[0]));
            let p = 'M' + point.left + ' ' + point.top + ' ';
            for (let i = 1; i < path.path.length; i++) {
                point = this.spaceToPixel(transformationMatrix.vector3Multiply(path.path[i]));
                let dist = this.distanceToCamera(transformationMatrix.vector3Multiply(path.path[i]));
                minDist = Math.min(minDist, dist);
                p += 'L' + point.left + ' ' + point.top + ' ';
            }
            return {
                path: path.path,
                close: path.close,
                d: path.close ? p + 'Z' : p,
                dist: minDist,
                style: path.style,
            };
        });

        // Rectangles
        let projectedRectangles: ProjectedRectangle[] = worldState.rectangles.map((rectangle: Rectangle3dAttributes): ProjectedRectangle => {
            let point = this.spaceToPixel(transformationMatrix.vector3Multiply(rectangle.path[0]));
            let minDist = this.distanceToCamera(transformationMatrix.vector3Multiply(rectangle.path[0]));
            let p = 'M' + point.left + ' ' + point.top + ' ';
            for (let i = 1; i < rectangle.path.length; i++) {
                point = this.spaceToPixel(transformationMatrix.vector3Multiply(rectangle.path[i]));
                let dist = this.distanceToCamera(transformationMatrix.vector3Multiply(rectangle.path[i]));
                minDist = Math.min(minDist, dist);
                p += 'L' + point.left + ' ' + point.top + ' ';
            }
            return {
                path: rectangle.path,
                d: p + 'Z',
                dist: minDist,
                style: rectangle.style,
            };
        });

        // Texts
        let projectedTexts: ProjectedText[] = worldState.texts.map((text: Text3dAttributes): ProjectedText => {
            let v = transformationMatrix.vector3Multiply(text.position);
            return {
                pixel: this.spaceToPixel(v),
                dist: this.distanceToCamera(v),
                position: {
                    x: text.position.x,
                    y: text.position.y,
                    z: text.position.z,
                },
                text: text.text,
                lockFontSize: text.lockFontSize,
                style: text.style,
            }
        });

        return {
            circles: projectedCircles,
            paths: projectedPaths,
            rectangles: projectedRectangles,
            texts: projectedTexts,
        };
    }

    private createShapes(data: ProjectedData) {
        this._shapes = new Shapes(
            'PRJ',
            {
                circles: data.circles.map((circle: ProjectedCircle): Circle => {
                    return new Circle(
                        circle.pixel.left,
                        circle.pixel.top,
                        this.getDistantDependentValue(circle.radius, circle.dist),
                        circle.dist,
                        {
                            strokeWidth: this.getDistantDependentValue(circle.style.strokeWidth, circle.dist),
                            stroke: circle.style.stroke,
                            strokeOpacity: circle.style.strokeOpacity,
                            fill: circle.style.fill,
                            fillOpacity: circle.style.fillOpacity,
                        },
                    )
                }),
                paths: data.paths.map((path: ProjectedPath): Path => {
                    return new Path(
                        path.d,
                        path.dist,
                        {
                            strokeWidth: this.getDistantDependentValue(path.style.strokeWidth, path.dist),
                            stroke: path.style.stroke,
                            strokeOpacity: path.style.strokeOpacity,
                        },
                    );
                }),
                rectangles: data.rectangles.map((rectangle: ProjectedRectangle): Rectangle => {
                    return new Rectangle(
                        rectangle.d,
                        rectangle.dist,
                        {
                            strokeWidth: this.getDistantDependentValue(rectangle.style.strokeWidth, rectangle.dist),
                            stroke: rectangle.style.stroke,
                            strokeOpacity: rectangle.style.strokeOpacity,
                            fill: rectangle.style.fill,
                            fillOpacity: rectangle.style.fillOpacity,
                        }
                    );
                }),
                texts: data.texts.map((text: ProjectedText): Text => {
                    return new Text(
                        text.pixel.left,
                        text.pixel.top,
                        text.lockFontSize ? text.style.fontSize : this.getDistantDependentValue(text.style.fontSize, text.dist),
                        text.text,
                        text.dist,
                        text.style,
                    )
                }),
            },
        );
    }

    private updateShapes(data: ProjectedData) {
        this._shapes.update((shapes) => {
            shapes.circles.forEach((circle, index) => {
                let projectedCircle = data.circles[index];
                circle.setPosition(
                    projectedCircle.pixel.left,
                    projectedCircle.pixel.top,
                    this.getDistantDependentValue(projectedCircle.radius, projectedCircle.dist),
                );
                circle.dist = projectedCircle.dist;
                circle.style = {
                    strokeWidth: this.getDistantDependentValue(projectedCircle.style.strokeWidth, projectedCircle.dist),
                    stroke: projectedCircle.style.stroke,
                    strokeOpacity: projectedCircle.style.strokeOpacity,
                    fill: projectedCircle.style.fill,
                    fillOpacity: projectedCircle.style.fillOpacity,
                };
                circle.visible = projectedCircle.dist > 0;
            });
            shapes.paths.forEach((path, index) => {
                let projectedPath = data.paths[index];
                path.setPath(projectedPath.d);
                path.dist = projectedPath.dist;
                path.style = {
                    strokeWidth: this.getDistantDependentValue(projectedPath.style.strokeWidth, projectedPath.dist),
                    stroke: projectedPath.style.stroke,
                    strokeOpacity: projectedPath.style.strokeOpacity,
                };
                path.visible = projectedPath.dist > 0;
            });
            shapes.rectangles.forEach((rectangle, index) => {
                let projectedRectangle = data.rectangles[index];
                rectangle.setPath(projectedRectangle.d);
                rectangle.dist = projectedRectangle.dist;
                rectangle.style = {
                    strokeWidth: this.getDistantDependentValue(projectedRectangle.style.strokeWidth, projectedRectangle.dist),
                    stroke: projectedRectangle.style.stroke,
                    strokeOpacity: projectedRectangle.style.strokeOpacity,
                    fill: projectedRectangle.style.fill,
                    fillOpacity: projectedRectangle.style.fillOpacity,
                };
                rectangle.visible = projectedRectangle.dist > 0;
            });
            shapes.texts.forEach((text, index) => {
                let projectedText = data.texts[index];
                text.setPosition(
                    projectedText.pixel.left,
                    projectedText.pixel.top,
                    projectedText.lockFontSize ? text.style.fontSize : this.getDistantDependentValue(text.style.fontSize, text.dist),
                );
                text.dist = projectedText.dist;
                text.style = projectedText.style;
                text.visible = projectedText.dist > 0;
                text.setText(projectedText.text);
            });
        });
    }

    private getDistantDependentValue(baseValue: number, distance: number): number {
        return distance > 0 ? baseValue / distance * 20 * this._elementStageSizeFactor : 0; // value 20 appromimated by trial and error
    }

    private spaceToPixel(coord: Vector3): PixelCoord {
        return this.planeToPixel(this.spaceToPlane(coord));
    }

    private spaceToPlane(coord: Vector3): PlaneCoord {
        if (coord.z < this._stageNear) {
            return {
                x: 0,
                y: 0
            }
        }

        const lambda = 1 / coord.z;
        return {
            x: lambda * coord.x,
            y: lambda * coord.y
        }
    }

    private distanceToCamera(coord: Vector3): number {
        if (coord.z < this._stageNear) {
            return -1;
        }
        return (coord.z * (this._stageFar - this._stageNear)) / (this._stageNear * (this._stageFar - coord.z));
    }

    private planeToPixel(coord: PlaneCoord): PixelCoord {
        return {
            left: this._stageWidthHalf * coord.x * this._stageRatioInverted + this._stageWidthHalf,
            top: -this._stageHeightHalf * coord.y + this._stageHeightHalf,
        }
    }
}
