import { CircleStyle } from '../types/shape/circle';
import { PathStyle } from '../types/shape/path';
import { darkenColor } from '../utils/darken-color';
import { TextStyle } from './../types/shape/text/attributes';

export const innerSunStyle: CircleStyle = {
    strokeWidth: 3,
    stroke: 'rgba(255, 231, 98, 1)',
    strokeOpacity: .7,
    fill: '#ffca1aff',
    fillOpacity: 1,
}

export const outerSunStyle: CircleStyle = {
    strokeWidth: 3,
    stroke: '#fe8',
    strokeOpacity: .5,
    fill: '#fff',
    fillOpacity: 0,
}

export const orbitStyle: PathStyle = {
    strokeWidth: 1,
    stroke: '#fff',
    strokeOpacity: 1,
}

export const mercuryStyle: CircleStyle = {
    strokeWidth: 0,
    stroke: '#000',
    strokeOpacity: 1,
    fill: '#A9A9A9',
    fillOpacity: 1,
}

export const venusStyle: CircleStyle = {
    strokeWidth: 0,
    stroke: '#000',
    strokeOpacity: 1,
    fill: '#E6C229',
    fillOpacity: 1,
}

export const earthStyle: CircleStyle = {
    strokeWidth: 0,
    stroke: '#000',
    strokeOpacity: 1,
    fill: '#1DA1F2',
    fillOpacity: 1,
}

export const marsStyle: CircleStyle = {
    strokeWidth: 0,
    stroke: '#000',
    strokeOpacity: 1,
    fill: '#C1440E',
    fillOpacity: 1,
}

export const jupiterStyle: CircleStyle = {
    strokeWidth: 0,
    stroke: '#000',
    strokeOpacity: 1,
    fill: '#F7CC7F',
    fillOpacity: 1,
}

export const saturnStyle: CircleStyle = {
    strokeWidth: 0,
    stroke: '#000',
    strokeOpacity: 1,
    fill: '#F5DEB3',
    fillOpacity: 1,
}

export const uranusStyle: CircleStyle = {
    strokeWidth: 0,
    stroke: '#000',
    strokeOpacity: 1,
    fill: '#AFD2E1',
    fillOpacity: 1,
}

export const neptuneStyle: CircleStyle = {
    strokeWidth: 0,
    stroke: '#000',
    strokeOpacity: 1,
    fill: '#1E90FF',
    fillOpacity: 1,
}

export const moonStyle: CircleStyle = {
    strokeWidth: 0,
    stroke: '#000',
    strokeOpacity: 1,
    fill: '#fff',
    fillOpacity: 1,
}

export const saturnRingStyle: PathStyle = {
    strokeWidth: 1,
    stroke: saturnStyle.fill,
    strokeOpacity: 0.5,
}

export function infoTextStyle(color: string): TextStyle {
    return {
        fontSize: 14,
        fontFamily: 'sans-serif',
        fill: darkenColor(color, 0.5),
        fillOpacity: 1,
        alignmentBaseline: 'baseline',
    }
}