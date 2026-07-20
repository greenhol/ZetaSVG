export interface Vector4 {
    x: number;
    y: number;
    z: number;
    w: number;
}

export interface Edge4 {
    p1: Vector4;
    p2: Vector4;
}

export const TESSERACT_SIZE = 4;
const SIZE_HALF = TESSERACT_SIZE / 2;

const V_NNNN: Vector4 = { x: -SIZE_HALF, y: -SIZE_HALF, z: -SIZE_HALF, w: -SIZE_HALF };
const V_PNNN: Vector4 = { x: SIZE_HALF, y: -SIZE_HALF, z: -SIZE_HALF, w: -SIZE_HALF };
const V_NPNN: Vector4 = { x: -SIZE_HALF, y: SIZE_HALF, z: -SIZE_HALF, w: -SIZE_HALF };
const V_PPNN: Vector4 = { x: SIZE_HALF, y: SIZE_HALF, z: -SIZE_HALF, w: -SIZE_HALF };
const V_NNPN: Vector4 = { x: -SIZE_HALF, y: -SIZE_HALF, z: SIZE_HALF, w: -SIZE_HALF };
const V_PNPN: Vector4 = { x: SIZE_HALF, y: -SIZE_HALF, z: SIZE_HALF, w: -SIZE_HALF };
const V_NPPN: Vector4 = { x: -SIZE_HALF, y: SIZE_HALF, z: SIZE_HALF, w: -SIZE_HALF };
const V_PPPN: Vector4 = { x: SIZE_HALF, y: SIZE_HALF, z: SIZE_HALF, w: -SIZE_HALF };
const V_NNNP: Vector4 = { x: -SIZE_HALF, y: -SIZE_HALF, z: -SIZE_HALF, w: SIZE_HALF };
const V_PNNP: Vector4 = { x: SIZE_HALF, y: -SIZE_HALF, z: -SIZE_HALF, w: SIZE_HALF };
const V_NPNP: Vector4 = { x: -SIZE_HALF, y: SIZE_HALF, z: -SIZE_HALF, w: SIZE_HALF };
const V_PPNP: Vector4 = { x: SIZE_HALF, y: SIZE_HALF, z: -SIZE_HALF, w: SIZE_HALF };
const V_NNPP: Vector4 = { x: -SIZE_HALF, y: -SIZE_HALF, z: SIZE_HALF, w: SIZE_HALF };
const V_PNPP: Vector4 = { x: SIZE_HALF, y: -SIZE_HALF, z: SIZE_HALF, w: SIZE_HALF };
const V_NPPP: Vector4 = { x: -SIZE_HALF, y: SIZE_HALF, z: SIZE_HALF, w: SIZE_HALF };
const V_PPPP: Vector4 = { x: SIZE_HALF, y: SIZE_HALF, z: SIZE_HALF, w: SIZE_HALF };

export const TESSERACT_VERTICES: Vector4[] = [
    V_NNNN, V_PNNN, V_NPNN, V_PPNN, V_NNPN, V_PNPN, V_NPPN, V_PPPN, V_NNNP, V_PNNP, V_NPNP, V_PPNP, V_NNPP, V_PNPP, V_NPPP, V_PPPP,
];

export const TESSERACT_EDGES: Edge4[] = [
    // from vNNNN
    { p1: V_NNNN, p2: V_PNNN },
    { p1: V_NNNN, p2: V_NPNN },
    { p1: V_NNNN, p2: V_NNPN },
    { p1: V_NNNN, p2: V_NNNP },
    // from vPNNN
    { p1: V_PNNN, p2: V_PPNN },
    { p1: V_PNNN, p2: V_PNPN },
    { p1: V_PNNN, p2: V_PNNP },
    // from vNPNN
    { p1: V_NPNN, p2: V_PPNN },
    { p1: V_NPNN, p2: V_NPPN },
    { p1: V_NPNN, p2: V_NPNP },
    // from vPPNN
    { p1: V_PPNN, p2: V_PPPN },
    { p1: V_PPNN, p2: V_PPNP },
    // from vNNPN
    { p1: V_NNPN, p2: V_PNPN },
    { p1: V_NNPN, p2: V_NPPN },
    { p1: V_NNPN, p2: V_NNPP },
    // from vPNPN
    { p1: V_PNPN, p2: V_PPPN },
    { p1: V_PNPN, p2: V_PNPP },
    // from vNPPN
    { p1: V_NPPN, p2: V_PPPN },
    { p1: V_NPPN, p2: V_NPPP },
    // from vPPPN
    { p1: V_PPPN, p2: V_PPPP },
    // from vNNNP
    { p1: V_NNNP, p2: V_PNNP },
    { p1: V_NNNP, p2: V_NPNP },
    { p1: V_NNNP, p2: V_NNPP },
    // from vPNNP
    { p1: V_PNNP, p2: V_PPNP },
    { p1: V_PNNP, p2: V_PNPP },
    // from vNPNP
    { p1: V_NPNP, p2: V_PPNP },
    { p1: V_NPNP, p2: V_NPPP },
    // from vPPNP
    { p1: V_PPNP, p2: V_PPPP },
    // from vNNPP
    { p1: V_NNPP, p2: V_PNPP },
    { p1: V_NNPP, p2: V_NPPP },
    // from vPNPP
    { p1: V_PNPP, p2: V_PPPP },
    // from vNPPP
    { p1: V_NPPP, p2: V_PPPP },
];