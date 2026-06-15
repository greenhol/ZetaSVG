import { InitializeAfterConstruct } from '../../shared';
import { ModuleConfig } from '../../shared/config';
import { Circle3d, circleStyle } from '../types/shape/circle';
import { Group3d, SortBy } from '../types/shape/group';
import { Path3d, pathStyle } from '../types/shape/path';
import { Text3d, textStyle } from '../types/shape/text';
import { Vector3 } from '../types/vector-3';
import { coloredDotProperties, createCircle3dAdobeRGB, createCircle3dP3, createCircle3dRec2020, createCircle3dSRGB, spectralLocus } from './color-spaces.data';
import { CREATE } from './ui/world-config-field-creator';
import { World, WorldConfig } from './world';

interface ColorSpacesConfig extends WorldConfig {
    radius: number;
    density: number;
    showInfo: boolean;
    showSRGB: boolean;
    showAdobeRGB: boolean;
    showP3: boolean;
    showRec2020: boolean;
}

@InitializeAfterConstruct()
export class ColorSpaces extends World {

    private d65CircleStyle = circleStyle()
        .fill('#fff')
        .strokeWidth(0.2)
        .stroke('#99f')
        .get();

    private spectralLocusPathStyle = pathStyle()
        .stroke('#99f')
        .get();

    private rectanglePathStyle = pathStyle()
        .stroke('#aaf')
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

        this.texts = [];
        this.paths = [new Path3d(spectralLocus, true, true, this.spectralLocusPathStyle)];
        this.circles = [new Circle3d({ x: 3.127, y: 3.290, z: 0 }, 4, this.d65CircleStyle)];

        const pathsInGroup = [];
        const circlesInGroup = [];

        if (this.config.data.showSRGB) {
            if (this.config.data.showInfo) {
                const anchorStart = coloredDotProperties.sRGB.green.position;
                const anchorEnd: Vector3 = { x: 6, y: anchorStart.y, z: 0 };
                pathsInGroup.push(
                    new Path3d([coloredDotProperties.sRGB.red.position, coloredDotProperties.sRGB.green.position, coloredDotProperties.sRGB.blue.position], true, true, this.rectanglePathStyle),
                    new Path3d([anchorStart, anchorEnd], false, true, this.infoPathStyle),
                );
                this.texts.push(new Text3d(anchorEnd, 'sRGB', false, this.infoTextStyle));
            }
            for (let t = 0; t < 1; t += this.config.data.density) {
                const posRG = this.interpolate(coloredDotProperties.sRGB.red.position, coloredDotProperties.sRGB.green.position, t);
                circlesInGroup.push(createCircle3dSRGB(posRG.x, posRG.y, this.config.data.radius));
                const posGB = this.interpolate(coloredDotProperties.sRGB.green.position, coloredDotProperties.sRGB.blue.position, t);
                circlesInGroup.push(createCircle3dSRGB(posGB.x, posGB.y, this.config.data.radius));
                const posBR = this.interpolate(coloredDotProperties.sRGB.blue.position, coloredDotProperties.sRGB.red.position, t);
                circlesInGroup.push(createCircle3dSRGB(posBR.x, posBR.y, this.config.data.radius));
            }
        }
        if (this.config.data.showAdobeRGB) {
            if (this.config.data.showInfo) {
                const anchorStart = coloredDotProperties.adobeRGB.green.position;
                const anchorEnd: Vector3 = { x: 6, y: anchorStart.y + 0.2, z: 0 };
                pathsInGroup.push(
                    new Path3d([coloredDotProperties.adobeRGB.red.position, coloredDotProperties.adobeRGB.green.position, coloredDotProperties.adobeRGB.blue.position], true, true, this.rectanglePathStyle),
                    new Path3d([anchorStart, anchorEnd], false, true, this.infoPathStyle),
                );
                this.texts.push(new Text3d(anchorEnd, 'Adobe RGB', false, this.infoTextStyle));
            }
            for (let t = 0; t < 1; t += this.config.data.density) {
                const posRG = this.interpolate(coloredDotProperties.adobeRGB.red.position, coloredDotProperties.adobeRGB.green.position, t);
                circlesInGroup.push(createCircle3dAdobeRGB(posRG.x, posRG.y, this.config.data.radius));
                const posGB = this.interpolate(coloredDotProperties.adobeRGB.green.position, coloredDotProperties.adobeRGB.blue.position, t);
                circlesInGroup.push(createCircle3dAdobeRGB(posGB.x, posGB.y, this.config.data.radius));
                const posBR = this.interpolate(coloredDotProperties.adobeRGB.blue.position, coloredDotProperties.adobeRGB.red.position, t);
                circlesInGroup.push(createCircle3dAdobeRGB(posBR.x, posBR.y, this.config.data.radius));
            }
        }
        if (this.config.data.showP3) {
            if (this.config.data.showInfo) {
                const anchorStart = coloredDotProperties.p3.green.position;
                const anchorEnd: Vector3 = { x: 6, y: anchorStart.y - 0.25, z: 0 };
                pathsInGroup.push(
                    new Path3d([coloredDotProperties.p3.red.position, coloredDotProperties.p3.green.position, coloredDotProperties.p3.blue.position], true, true, this.rectanglePathStyle),
                    new Path3d([anchorStart, anchorEnd], false, true, this.infoPathStyle),
                );
                this.texts.push(new Text3d(anchorEnd, 'P3', false, this.infoTextStyle));
            }
            for (let t = 0; t < 1; t += this.config.data.density) {
                const posRG = this.interpolate(coloredDotProperties.p3.red.position, coloredDotProperties.p3.green.position, t);
                circlesInGroup.push(createCircle3dP3(posRG.x, posRG.y, this.config.data.radius));
                const posGB = this.interpolate(coloredDotProperties.p3.green.position, coloredDotProperties.p3.blue.position, t);
                circlesInGroup.push(createCircle3dP3(posGB.x, posGB.y, this.config.data.radius));
                const posBR = this.interpolate(coloredDotProperties.p3.blue.position, coloredDotProperties.p3.red.position, t);
                circlesInGroup.push(createCircle3dP3(posBR.x, posBR.y, this.config.data.radius));
            }
        }
        if (this.config.data.showRec2020) {
            if (this.config.data.showInfo) {
                const anchorStart = coloredDotProperties.rec2020.green.position;
                const anchorEnd: Vector3 = { x: 6, y: anchorStart.y, z: 0 };
                pathsInGroup.push(
                    new Path3d([coloredDotProperties.rec2020.red.position, coloredDotProperties.rec2020.green.position, coloredDotProperties.rec2020.blue.position], true, true, this.rectanglePathStyle),
                    new Path3d([anchorStart, anchorEnd], false, true, this.infoPathStyle),
                );
                this.texts.push(new Text3d(anchorEnd, 'Rec2020', false, this.infoTextStyle));
            }
            for (let t = 0; t < 1; t += this.config.data.density) {
                const posRG = this.interpolate(coloredDotProperties.rec2020.red.position, coloredDotProperties.rec2020.green.position, t);
                circlesInGroup.push(createCircle3dRec2020(posRG.x, posRG.y, this.config.data.radius));
                const posGB = this.interpolate(coloredDotProperties.rec2020.green.position, coloredDotProperties.rec2020.blue.position, t);
                circlesInGroup.push(createCircle3dRec2020(posGB.x, posGB.y, this.config.data.radius));
                const posBR = this.interpolate(coloredDotProperties.rec2020.blue.position, coloredDotProperties.rec2020.red.position, t);
                circlesInGroup.push(createCircle3dRec2020(posBR.x, posBR.y, this.config.data.radius));
            }
        }

        this.groups = [
            new Group3d(
                Vector3.origin(),
                [...pathsInGroup, ...circlesInGroup],
                SortBy.INDEX,
            )
        ];
    }

    private interpolate(pos1: Vector3, pos2: Vector3, t: number): Vector3 {
        return {
            x: pos1.x + t * (pos2.x - pos1.x),
            y: pos1.y + t * (pos2.y - pos1.y),
            z: pos1.z + t * (pos2.z - pos1.z),
        };
    }

    override config = new ModuleConfig<ColorSpacesConfig>(
        {
            cameraPerspective: {
                position: { x: 3.5, y: 4.2, z: -5 },
                angleX: 0,
                angleY: 0,
                angleZ: 0,
                fov: 50,
                type: 'Orbit',
            },
            radius: 2,
            density: 0.05,
            showInfo: true,
            showSRGB: true,
            showAdobeRGB: true,
            showP3: true,
            showRec2020: false,
        },
        "colorSpacesConfig",
        [
            CREATE.createFloatField('radius', 'Dot Radius', '', 0.1, 10),
            CREATE.createFloatField('density', 'Density', 'Density (by distance) between color dots', 0.001, 1),
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
