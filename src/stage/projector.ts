import { combineLatest, sampleTime, take } from 'rxjs';
import { AxisEnum } from '../types/axis-enum';
import { IdentityMatrix4, Matrix4, RotaryMatrix4, TranslateMatrix4 } from '../types/matrix/matrix-4';
import { Circle, Circle3dAttributes } from '../types/shape/circle';
import { Group, Group3dAttributes, GroupChild } from '../types/shape/group';
import { Path, Path3dAttributes } from '../types/shape/path';
import { Rectangle } from '../types/shape/rectangle';
import { ShapeType } from '../types/shape/shape';
import { Shapes } from '../types/shape/shapes';
import { Text, Text3dAttributes } from '../types/shape/text';
import { addVector3, Vector3 } from '../types/vector-3';
import { World, WorldState } from '../world/world';
import { Rectangle3dAttributes } from './../types/shape/rectangle/attributes';
import { Camera } from './camera';

interface PlaneCoord {
    x: number;
    y: number;
}

interface PixelCoord {
    left: number;
    top: number;
}

interface ProjectedGroup extends Group3dAttributes {
    projectedChildren: ProjectedChild[];
    dist: number;
}

interface ProjectedChild {
    child: ProjectedCircle | ProjectedPath,
    index: number,
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
    groups: ProjectedGroup[];
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

    constructor(world: World, camera: Camera, widh: number, height: number, worldTick: number) {
        this._stageWidthHalf = widh / 2;
        this._stageHeightHalf = height / 2;
        this._stageRatioInverted = height / widh;
        this._stageNear = 1;
        this._stageFar = 30;
        this._elementStageSizeFactor = height / 720; // 720 is default height for reference

        this._world = world;
        this._camera = camera;

        this._world.state$.pipe(take(1)).subscribe(state => {
            this.createShapes(this.createData(state));
        });
        // ToDo: problematic? What if this one overtakes createShapes?!?
        combineLatest([this._world.state$, this._camera.state$])
            .pipe(sampleTime(worldTick))
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

        // Groups
        const projectedGroups: ProjectedGroup[] = worldState.groups.map((group: Group3dAttributes): ProjectedGroup => {
            let v = transformationMatrix.vector3Multiply(group.position);
            const projectedChildren: ProjectedChild[] = [];
            group.children.forEach((child: (Circle3dAttributes | Path3dAttributes), index: number) => {
                switch (child.type) {
                    case (ShapeType.CIRCLE): {
                        projectedChildren.push({
                            child: this.projectCircle(this.translateCircle(child as Circle3dAttributes, group.position), transformationMatrix),
                            index: index,
                        });
                        break;
                    }
                    case (ShapeType.PATH): {
                        projectedChildren.push({
                            child: this.projectPath(this.translatePath(child as Path3dAttributes, group.position), transformationMatrix),
                            index: index,
                        });
                        break;
                    }
                }
            });

            return {
                visible: group.visible,
                type: group.type,
                children: group.children,
                sortBy: group.sortBy,
                projectedChildren: projectedChildren,
                dist: this.distanceToCamera(v),
                position: group.position,
            }
        });

        // Circles
        const projectedCircles: ProjectedCircle[] = worldState.circles.map((circle: Circle3dAttributes): ProjectedCircle => {
            return this.projectCircle(circle, transformationMatrix);
        });

        // Paths
        const projectedPaths: ProjectedPath[] = worldState.paths.map((path: Path3dAttributes): ProjectedPath => {
            return this.projectPath(path, transformationMatrix);
        });

        // Rectangles
        const projectedRectangles: ProjectedRectangle[] = worldState.rectangles.map((rectangle: Rectangle3dAttributes): ProjectedRectangle => {
            return this.projectRectangle(rectangle, transformationMatrix);
        });

        // Texts
        const projectedTexts: ProjectedText[] = worldState.texts.map((text: Text3dAttributes): ProjectedText => {
            return this.projectText(text, transformationMatrix);
        });

        return {
            groups: projectedGroups,
            circles: projectedCircles,
            paths: projectedPaths,
            rectangles: projectedRectangles,
            texts: projectedTexts,
        };
    }

    private translateCircle(circle: Circle3dAttributes, offset: Vector3): Circle3dAttributes {
        return {
            visible: circle.visible,
            type: circle.type,
            position: addVector3(circle.position, offset),
            radius: circle.radius,
            style: circle.style,
        }
    }

    private translatePath(path: Path3dAttributes, offset: Vector3): Path3dAttributes {
        return {
            visible: path.visible,
            type: path.type,
            path: path.path.map((point: Vector3) => addVector3(point, offset)),
            close: path.close,
            lockStrokeWidth: path.lockStrokeWidth,
            style: path.style,
        }
    }

    private projectCircle(circle: Circle3dAttributes, m: Matrix4): ProjectedCircle {
        let v = m.vector3Multiply(circle.position);
        return {
            visible: circle.visible,
            type: circle.type,
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
    }

    private projectPath(path: Path3dAttributes, m: Matrix4): ProjectedPath {
        let v = m.vector3Multiply(path.path[0])
        let point = this.spaceToPixel(v);
        let dist, minDist = this.distanceToCamera(v);
        let p = 'M' + point.left + ' ' + point.top + ' ';
        for (let i = 1; i < path.path.length; i++) {
            v = m.vector3Multiply(path.path[i]);
            point = this.spaceToPixel(v);
            dist = this.distanceToCamera(v);
            minDist = Math.min(minDist, dist);
            p += 'L' + point.left + ' ' + point.top + ' ';
        }
        return {
            visible: path.visible,
            type: path.type,
            path: path.path,
            close: path.close,
            d: path.close ? p + 'Z' : p,
            dist: minDist,
            lockStrokeWidth: path.lockStrokeWidth,
            style: path.style,
        };
    }

    private projectRectangle(rectangle: Rectangle3dAttributes, m: Matrix4): ProjectedRectangle {
        let v = m.vector3Multiply(rectangle.path[0])
        let point = this.spaceToPixel(v);
        let dist, minDist = this.distanceToCamera(v);
        let p = 'M' + point.left + ' ' + point.top + ' ';
        for (let i = 1; i < rectangle.path.length; i++) {
            v = m.vector3Multiply(rectangle.path[i]);
            point = this.spaceToPixel(v);
            dist = this.distanceToCamera(v);
            minDist = Math.min(minDist, dist);
            p += 'L' + point.left + ' ' + point.top + ' ';
        }
        return {
            visible: rectangle.visible,
            type: rectangle.type,
            path: rectangle.path,
            d: p + 'Z',
            dist: minDist,
            style: rectangle.style,
        };
    }

    private projectText(text: Text3dAttributes, m: Matrix4): ProjectedText {
        let v = m.vector3Multiply(text.position);
        return {
            visible: text.visible,
            type: text.type,
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
    }

    private createShapes(data: ProjectedData) {
        this._shapes = new Shapes(
            'PRJ',
            {
                groups: data.groups.map((group: ProjectedGroup): Group => {
                    const children: GroupChild[] = [];
                    group.projectedChildren.forEach((child: ProjectedChild) => {
                        switch (child.child.type) {
                            case ShapeType.CIRCLE: {
                                children.push({
                                    child: this.createCircle(child.child as ProjectedCircle),
                                    index: child.index,
                                });
                                break;
                            }
                            case ShapeType.PATH: {
                                children.push({
                                    child: this.createPath(child.child as ProjectedPath),
                                    index: child.index,
                                });
                                break;
                            }
                        }
                    });
                    return new Group(
                        children,
                        group.sortBy,
                        group.dist,
                        group.visible,
                    )
                }),
                circles: data.circles.map((projectedCircle: ProjectedCircle): Circle => this.createCircle(projectedCircle)),
                paths: data.paths.map((projectedPath: ProjectedPath): Path => this.createPath(projectedPath)),
                rectangles: data.rectangles.map((projectedRectangle: ProjectedRectangle): Rectangle => this.createRectangle(projectedRectangle)),
                texts: data.texts.map((projectedText: ProjectedText): Text => this.createText(projectedText)),
            },
        );
    }

    private createCircle(circle: ProjectedCircle): Circle {
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
            circle.visible,
        )
    }

    private createPath(path: ProjectedPath): Path {
        return new Path(
            path.d,
            path.dist,
            {
                strokeWidth: path.lockStrokeWidth ? path.style.strokeWidth : this.getDistantDependentValue(path.style.strokeWidth, path.dist),
                stroke: path.style.stroke,
                strokeOpacity: path.style.strokeOpacity,
                strokeLinecap: path.style.strokeLinecap,
                strokeLinejoin: path.style.strokeLinejoin,
            },
            path.visible,
        );
    }

    private createRectangle(rectangle: ProjectedRectangle): Rectangle {
        return new Rectangle(
            rectangle.d,
            rectangle.dist,
            {
                strokeWidth: this.getDistantDependentValue(rectangle.style.strokeWidth, rectangle.dist),
                stroke: rectangle.style.stroke,
                strokeOpacity: rectangle.style.strokeOpacity,
                strokeLinejoin: rectangle.style.strokeLinejoin,
                fill: rectangle.style.fill,
                fillOpacity: rectangle.style.fillOpacity,
            },
            rectangle.visible,
        );
    }

    private createText(text: ProjectedText): Text {
        return new Text(
            text.pixel.left,
            text.pixel.top,
            text.text,
            text.dist,
            {
                fontSize: text.lockFontSize ? text.style.fontSize : this.getDistantDependentValue(text.style.fontSize, text.dist),
                fontFamily: text.style.fontFamily,
                fill: text.style.fill,
                fillOpacity: text.style.fillOpacity,
                alignmentBaseline: text.style.alignmentBaseline,
            },
            text.visible,
        )
    }

    private updateShapes(data: ProjectedData) {
        this._shapes.update((shapes) => {
            shapes.groups.forEach((group: Group, index: number) => this.updateGroup(group, data.groups[index]));
            shapes.circles.forEach((circle: Circle, index: number) => this.updateCircle(circle, data.circles[index]));
            shapes.paths.forEach((path: Path, index: number) => this.updatePath(path, data.paths[index]));
            shapes.rectangles.forEach((rectangle: Rectangle, index) => this.updateRectangles(rectangle, data.rectangles[index]));
            shapes.texts.forEach((text: Text, index: number) => this.updateText(text, data.texts[index]));
        });
    }

    private updateGroup(group: Group, projectedGroup: ProjectedGroup): void {
        group.children.forEach((child: GroupChild, index: number) => {
            switch (child.child.type) {
                case ShapeType.CIRCLE: {
                    const shape = child.child;
                    const projectedShape = projectedGroup.projectedChildren[index].child;
                    if (shape.type != ShapeType.CIRCLE || projectedShape.type != ShapeType.CIRCLE) {
                        console.error(`#updateGroup: Error in Child Elements shape=${shape} and projectedShape=${projectedShape} should be ${ShapeType.CIRCLE}!`);
                    }
                    this.updateCircle((shape as Circle), (projectedShape as ProjectedCircle), child.index);
                    break;
                }
                case ShapeType.PATH: {
                    const shape = child.child;
                    const projectedShape = projectedGroup.projectedChildren[index].child;
                    if (shape.type != ShapeType.PATH || projectedShape.type != ShapeType.PATH) {
                        console.error(`#updateGroup: Error in Child Elements shape=${shape} and projectedShape=${projectedShape} should be ${ShapeType.PATH}!`);
                    }
                    this.updatePath((shape as Path), (projectedShape as ProjectedPath), child.index);
                    break;
                }
            }
        });
        group.dist = projectedGroup.dist;
        group.sortBy = projectedGroup.sortBy;
        group.visible = projectedGroup.visible;
        group.inView = projectedGroup.dist > 0;
    }

    private updateCircle(circle: Circle, projectedCircle: ProjectedCircle, index: number | null = null): void {
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
        if (index != null) circle.index = index;
        circle.visible = projectedCircle.visible;
        circle.inView = projectedCircle.dist > 0;
    }

    private updateRectangles(rectangle: Rectangle, projectedRectangle: ProjectedRectangle): void {
        rectangle.setPath(projectedRectangle.d);
        rectangle.dist = projectedRectangle.dist;
        rectangle.style = {
            strokeWidth: this.getDistantDependentValue(projectedRectangle.style.strokeWidth, projectedRectangle.dist),
            stroke: projectedRectangle.style.stroke,
            strokeOpacity: projectedRectangle.style.strokeOpacity,
            strokeLinejoin: projectedRectangle.style.strokeLinejoin,
            fill: projectedRectangle.style.fill,
            fillOpacity: projectedRectangle.style.fillOpacity,
        };
        rectangle.visible = projectedRectangle.visible;
        rectangle.inView = projectedRectangle.dist > 0;
    }

    private updatePath(path: Path, projectedPath: ProjectedPath, index: number | null = null): void {
        path.setPath(projectedPath.d);
        path.dist = projectedPath.dist;
        path.style = {
            strokeWidth: projectedPath.lockStrokeWidth ? projectedPath.style.strokeWidth : this.getDistantDependentValue(projectedPath.style.strokeWidth, projectedPath.dist),
            stroke: projectedPath.style.stroke,
            strokeOpacity: projectedPath.style.strokeOpacity,
            strokeLinecap: projectedPath.style.strokeLinecap,
            strokeLinejoin: projectedPath.style.strokeLinejoin,
        };
        if (index != null) path.index = index;
        path.visible = projectedPath.visible;
        path.inView = projectedPath.dist > 0;
    }

    private updateText(text: Text, projectedText: ProjectedText): void {
        text.setPosition(
            projectedText.pixel.left,
            projectedText.pixel.top,
        );
        text.dist = projectedText.dist;
        text.style = {
            fontSize: projectedText.lockFontSize ? projectedText.style.fontSize : this.getDistantDependentValue(projectedText.style.fontSize, projectedText.dist),
            fontFamily: projectedText.style.fontFamily,
            fill: projectedText.style.fill,
            fillOpacity: projectedText.style.fillOpacity,
            alignmentBaseline: projectedText.style.alignmentBaseline,
        };
        text.visible = projectedText.visible;
        text.inView = projectedText.dist > 0;
        text.setText(projectedText.text);
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
