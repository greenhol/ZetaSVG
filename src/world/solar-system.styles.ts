import { circleStyle } from '../types/shape/circle';
import { pathStyle } from '../types/shape/path';
import { darkenColor } from '../utils/darken-color';
import { textStyle, TextStyle } from './../types/shape/text';

export const innerSunStyle = circleStyle()
    .strokeWidth(3)
    .stroke('rgba(255, 231, 98, 1)')
    .strokeOpacity(.7)
    .fill('#ffca1aff')
    .get();

export const outerSunStyle = circleStyle()
    .strokeWidth(3)
    .stroke('#fe8')
    .strokeOpacity(.5)
    .fill('none')
    .get();

export const orbitStyle = pathStyle()
    .strokeWidth(1)
    .stroke('#fff')
    .get();

export const mercuryStyle = circleStyle()
    .strokeWidth(0)
    .stroke('#000')
    .fill('#A9A9A9')
    .get();

export const venusStyle = circleStyle()
    .strokeWidth(0)
    .stroke('#000')
    .fill('#E6C229')
    .get();

export const earthStyle = circleStyle()
    .strokeWidth(0)
    .stroke('#000')
    .fill('#1DA1F2')
    .get();

export const marsStyle = circleStyle()
    .strokeWidth(0)
    .stroke('#000')
    .fill('#C1440E')
    .get();

export const jupiterStyle = circleStyle()
    .strokeWidth(0)
    .stroke('#000')
    .fill('#F7CC7F')
    .get();

export const saturnStyle = circleStyle()
    .strokeWidth(0)
    .stroke('#000')
    .fill('#F5DEB3')
    .get();

export const uranusStyle = circleStyle()
    .strokeWidth(0)
    .stroke('#000')
    .fill('#AFD2E1')
    .get();

export const neptuneStyle = circleStyle()
    .strokeWidth(0)
    .stroke('#000')
    .fill('#1E90FF')
    .get();

export const moonStyle = circleStyle()
    .strokeWidth(0)
    .stroke('#000')
    .fill('#fff')
    .get();

export const saturnRingStyle = pathStyle()
    .strokeWidth(1)
    .stroke(saturnStyle.fill)
    .strokeOpacity(0.5)
    .get();


export function infoTextStyle(color: string): TextStyle {
    return textStyle()
        .fontSize(18)
        .fill(darkenColor(color, 0.5))
        .get();
}