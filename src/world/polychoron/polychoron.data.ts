export enum PolychoronType {
    CELL_5 = '5-Cell (Pentatope)',
    CELL_8 = '8-Cell (Tesseract)',
    CELL_16 = '16-Cell (Hyperoctahedron)',
    CELL_24 = '24-Cell (Icositetrachoron)'
}

export type CellCount = 5 | 8 | 16 | 24;

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

export interface PolychoronData {
    vertices: Vector4[];
    edges: Edge4[];
}

const CELL_5_SIZE = 2;
const CELL_8_SIZE = 4;
const CELL_16_SIZE = 3.5;
const CELL_24_SIZE = 2.5;

// Connect every vertex pair at a given squared distance apart (within epsilon)
function edgesByDistance(vertices: Vector4[], distSq: number, epsilon = 1e-6): Edge4[] {
    const edges: Edge4[] = [];
    for (let i = 0; i < vertices.length; i++) {
        for (let j = i + 1; j < vertices.length; j++) {
            const a = vertices[i], b = vertices[j];
            const d = (a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2 + (a.w - b.w) ** 2;
            if (Math.abs(d - distSq) < epsilon) {
                edges.push({ p1: a, p2: b });
            }
        }
    }
    return edges;
}

// --- 5-cell: 5 vertices, fully connected (10 edges) ---
function generate5Cell(): PolychoronData {
    const s = CELL_5_SIZE / Math.sqrt(5);
    const vertices: Vector4[] = [
        { x: CELL_5_SIZE, y: CELL_5_SIZE, z: CELL_5_SIZE, w: -s },
        { x: CELL_5_SIZE, y: -CELL_5_SIZE, z: -CELL_5_SIZE, w: -s },
        { x: -CELL_5_SIZE, y: CELL_5_SIZE, z: -CELL_5_SIZE, w: -s },
        { x: -CELL_5_SIZE, y: -CELL_5_SIZE, z: CELL_5_SIZE, w: -s },
        { x: 0, y: 0, z: 0, w: 4 * s },
    ];
    const edges: Edge4[] = [];
    for (let i = 0; i < vertices.length; i++) {
        for (let j = i + 1; j < vertices.length; j++) {
            edges.push({ p1: vertices[i], p2: vertices[j] });
        }
    }
    return { vertices, edges };
}

// --- 8-cell (tesseract): all 16 sign combinations (32 edges) ---
function generate8Cell(): PolychoronData {
    const halfSize = CELL_8_SIZE / 2;
    const vertices: Vector4[] = [];
    for (let i = 0; i < 16; i++) {
        vertices.push({
            x: (i & 1) ? halfSize : -halfSize,
            y: (i & 2) ? halfSize : -halfSize,
            z: (i & 4) ? halfSize : -halfSize,
            w: (i & 8) ? halfSize : -halfSize,
        });
    }
    // edges connect vertices differing in exactly one coordinate -> distance² = (2*HALF)²
    const edges = edgesByDistance(vertices, (2 * halfSize) ** 2);
    return { vertices, edges };
}

// --- 16-cell: (±HALF,0,0,0) and permutations (8 vertices, 24 edges) ---
function generate16Cell(): PolychoronData {
    const vertices: Vector4[] = [
        { x: CELL_16_SIZE, y: 0, z: 0, w: 0 },
        { x: -CELL_16_SIZE, y: 0, z: 0, w: 0 },
        { x: 0, y: CELL_16_SIZE, z: 0, w: 0 },
        { x: 0, y: -CELL_16_SIZE, z: 0, w: 0 },
        { x: 0, y: 0, z: CELL_16_SIZE, w: 0 },
        { x: 0, y: 0, z: -CELL_16_SIZE, w: 0 },
        { x: 0, y: 0, z: 0, w: CELL_16_SIZE },
        { x: 0, y: 0, z: 0, w: -CELL_16_SIZE },
    ];
    // nearest neighbors: distance² = 2*HALF²; opposites: distance² = 4*HALF² (excluded)
    const edges = edgesByDistance(vertices, 2 * CELL_16_SIZE * CELL_16_SIZE);
    return { vertices, edges };
}

// --- 24-cell: permutations of (±HALF,±HALF,0,0) (24 vertices, 96 edges) ---
function generate24Cell(): PolychoronData {
    const vertices: Vector4[] = [];
    const signs = [1, -1];
    const axisPairs: [number, number][] = [
        [0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3],
    ];
    for (const [i, j] of axisPairs) {
        for (const si of signs) {
            for (const sj of signs) {
                const coords = [0, 0, 0, 0];
                coords[i] = si * CELL_24_SIZE;
                coords[j] = sj * CELL_24_SIZE;
                vertices.push({ x: coords[0], y: coords[1], z: coords[2], w: coords[3] });
            }
        }
    }
    // nearest-neighbor distance² = 2*HALF²
    const edges = edgesByDistance(vertices, 2 * CELL_24_SIZE * CELL_24_SIZE);
    return { vertices, edges };
}

export function generatePolytope(cellCount: CellCount): PolychoronData {
    switch (cellCount) {
        case 5: return generate5Cell();
        case 8: return generate8Cell();
        case 16: return generate16Cell();
        case 24: return generate24Cell();
    }
}
