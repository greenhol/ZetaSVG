import { InitializeAfterConstruct } from '../../shared';
import { ModuleConfig } from '../../shared/config';
import { Circle3d, circleStyle } from '../types/shape/circle';
import { Group3d, SortBy } from '../types/shape/group';
import { Path3d, pathStyle } from '../types/shape/path';
import { Text3d, textStyle } from '../types/shape/text';
import { Vector3 } from '../types/vector-3';
import { ColorSpaces2dData } from './color-spaces-2d.data';
import { MainColorProperties } from './color-spaces.data';
import { CREATE } from './ui/world-config-field-creator';
import { World, WorldConfig } from './world';

interface ColorSpaces2DConfig extends WorldConfig {
    radius: number;
    dotSpacing: number;
    showInfo: boolean;
    showSRGB: boolean;
    showAdobeRGB: boolean;
    showP3: boolean;
    showRec2020: boolean;
}

@InitializeAfterConstruct()
export class ColorSpaces2D extends World {

    private d65CircleStyle = circleStyle()
        .fill('#fff')
        .strokeWidth(0.2)
        .stroke('#99f')
        .get();

    private spectralLocusPathStyle = pathStyle()
        .stroke('#99f')
        .get();

    private rectanglePathStyle = pathStyle()
        .stroke('#bbb')
        .strokeWidth(3)
        .strokeOpacity(0.33)
        .strokeLinejoin('round')
        .get();

    private infoPathStyle = pathStyle()
        .stroke('#aaf')
        .strokeWidth(1)
        .get();

    private infoTextStyle = textStyle()
        .alignmentBaseline('middle')
        .fontSize(6)
        .get();

    constructor() {
        super();
        const data = new ColorSpaces2dData();

        this.texts = [];
        this.paths = [new Path3d(data.spectralLocus.map((pos) => { return Vector3.add(pos, data.d65offset); }), true, true, this.spectralLocusPathStyle)];

        const pathsInGroup = [];
        const circlesInGroup = [new Circle3d({ x: data.d65x, y: data.d65y, z: data.d65z }, 4, this.d65CircleStyle)];

        if (this.config.data.showSRGB) {
            if (this.config.data.showInfo) {
                const anchorStart = data.dotProp.sRGB.green.position;
                const anchorEnd: Vector3 = { x: 6, y: anchorStart.y, z: 0 };
                pathsInGroup.push(
                    new Path3d([data.dotProp.sRGB.red.position, data.dotProp.sRGB.green.position, data.dotProp.sRGB.blue.position], true, true, this.rectanglePathStyle),
                    new Path3d([anchorStart, anchorEnd], false, true, this.infoPathStyle),
                );
                this.texts.push(new Text3d(Vector3.add(anchorEnd, data.d65offset), 'sRGB', false, this.infoTextStyle));
            }
            for (let t = 0; t < 1; t += this.config.data.dotSpacing) {
                const posRG = Vector3.interpolate(data.dotProp.sRGB.red.position, data.dotProp.sRGB.green.position, t);
                circlesInGroup.push(data.createCircle3dSRGB(posRG, this.config.data.radius));
                const posGB = Vector3.interpolate(data.dotProp.sRGB.green.position, data.dotProp.sRGB.blue.position, t);
                circlesInGroup.push(data.createCircle3dSRGB(posGB, this.config.data.radius));
                const posBR = Vector3.interpolate(data.dotProp.sRGB.blue.position, data.dotProp.sRGB.red.position, t);
                circlesInGroup.push(data.createCircle3dSRGB(posBR, this.config.data.radius));
            }
        }
        if (this.config.data.showAdobeRGB) {
            if (this.config.data.showInfo) {
                const anchorStart = data.dotProp.adobeRGB.green.position;
                const anchorEnd: Vector3 = { x: 6, y: anchorStart.y + 0.2, z: 0 };
                pathsInGroup.push(
                    new Path3d([data.dotProp.adobeRGB.red.position, data.dotProp.adobeRGB.green.position, data.dotProp.adobeRGB.blue.position], true, true, this.rectanglePathStyle),
                    new Path3d([anchorStart, anchorEnd], false, true, this.infoPathStyle),
                );
                this.texts.push(new Text3d(Vector3.add(anchorEnd, data.d65offset), 'Adobe RGB', false, this.infoTextStyle));
            }
            for (let t = 0; t < 1; t += this.config.data.dotSpacing) {
                const posRG = Vector3.interpolate(data.dotProp.adobeRGB.red.position, data.dotProp.adobeRGB.green.position, t);
                circlesInGroup.push(data.createCircle3dAdobeRGB(posRG, this.config.data.radius));
                const posGB = Vector3.interpolate(data.dotProp.adobeRGB.green.position, data.dotProp.adobeRGB.blue.position, t);
                circlesInGroup.push(data.createCircle3dAdobeRGB(posGB, this.config.data.radius));
                const posBR = Vector3.interpolate(data.dotProp.adobeRGB.blue.position, data.dotProp.adobeRGB.red.position, t);
                circlesInGroup.push(data.createCircle3dAdobeRGB(posBR, this.config.data.radius));
            }
        }
        if (this.config.data.showP3) {
            if (this.config.data.showInfo) {
                const anchorStart = data.dotProp.p3.green.position;
                const anchorEnd: Vector3 = { x: 6, y: anchorStart.y - 0.25, z: 0 };
                pathsInGroup.push(
                    new Path3d([data.dotProp.p3.red.position, data.dotProp.p3.green.position, data.dotProp.p3.blue.position], true, true, this.rectanglePathStyle),
                    new Path3d([anchorStart, anchorEnd], false, true, this.infoPathStyle),
                );
                this.texts.push(new Text3d(Vector3.add(anchorEnd, data.d65offset), 'P3', false, this.infoTextStyle));
            }
            for (let t = 0; t < 1; t += this.config.data.dotSpacing) {
                const posRG = Vector3.interpolate(data.dotProp.p3.red.position, data.dotProp.p3.green.position, t);
                circlesInGroup.push(data.createCircle3dP3(posRG, this.config.data.radius));
                const posGB = Vector3.interpolate(data.dotProp.p3.green.position, data.dotProp.p3.blue.position, t);
                circlesInGroup.push(data.createCircle3dP3(posGB, this.config.data.radius));
                const posBR = Vector3.interpolate(data.dotProp.p3.blue.position, data.dotProp.p3.red.position, t);
                circlesInGroup.push(data.createCircle3dP3(posBR, this.config.data.radius));
            }
        }
        if (this.config.data.showRec2020) {
            if (this.config.data.showInfo) {
                const anchorStart = data.dotProp.rec2020.green.position;
                const anchorEnd: Vector3 = { x: 6, y: anchorStart.y, z: 0 };
                pathsInGroup.push(
                    new Path3d([data.dotProp.rec2020.red.position, data.dotProp.rec2020.green.position, data.dotProp.rec2020.blue.position], true, true, this.rectanglePathStyle),
                    new Path3d([anchorStart, anchorEnd], false, true, this.infoPathStyle),
                );
                this.texts.push(new Text3d(Vector3.add(anchorEnd, data.d65offset), 'Rec2020', false, this.infoTextStyle));
            }
            for (let t = 0; t < 1; t += this.config.data.dotSpacing) {
                const posRG = Vector3.interpolate(data.dotProp.rec2020.red.position, data.dotProp.rec2020.green.position, t);
                circlesInGroup.push(data.createCircle3dRec2020(posRG, this.config.data.radius));
                const posGB = Vector3.interpolate(data.dotProp.rec2020.green.position, data.dotProp.rec2020.blue.position, t);
                circlesInGroup.push(data.createCircle3dRec2020(posGB, this.config.data.radius));
                const posBR = Vector3.interpolate(data.dotProp.rec2020.blue.position, data.dotProp.rec2020.red.position, t);
                circlesInGroup.push(data.createCircle3dRec2020(posBR, this.config.data.radius));
            }
        }

        this.groups = [
            new Group3d(
                data.d65offset,
                [...pathsInGroup, ...circlesInGroup],
                SortBy.DISTANCE,
            )
        ];
    }

    override config = new ModuleConfig<ColorSpaces2DConfig>(
        {
            cameraPerspective: {
                position: { x: 0, y: 1, z: -4.5 },
                angleX: 0,
                angleY: 0,
                angleZ: 0,
                fov: 90,
                type: 'Orbit',
            },
            radius: 2,
            dotSpacing: 0.05,
            showInfo: true,
            showSRGB: true,
            showAdobeRGB: true,
            showP3: true,
            showRec2020: false,
        },
        "colorSpaces2DConfig",
        [
            CREATE.createFloatField('radius', 'Dot Radius', '', 0.1, 10),
            CREATE.createFloatField('dotSpacing', 'Dot Spacing', 'Controls density by spacing between coloured dots', 0.001, 1),
            CREATE.createBoolField('showInfo', 'Show Info'),
            CREATE.createBoolField('showSRGB', 'sRGB'),
            CREATE.createBoolField('showAdobeRGB', 'Adobe RGB'),
            CREATE.createBoolField('showP3', 'P3'),
            CREATE.createBoolField('showRec2020', 'Rec2020', 'Currently only supported on dsplays you cannot afford anyway'),
        ]
    );

    override backgroundColor = '#f8f8ff';

    public transitionToStateAt(t: number): void {
        // Nothing to do here
    }
}
