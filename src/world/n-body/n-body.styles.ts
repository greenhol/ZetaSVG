const COLOURS: string[] = [
    '#2d699c',
    '#3b6c5c',
    '#5b616f',
    '#64605a',
    '#c15d53',
    '#c5603b',
    '#368695',
    '#4a80af',
    '#6e7e80',
    '#2f93bb',
    '#c26c7a',
    '#878974',
    '#539791',
    '#9681a6',
    '#bf7b5b',
    '#c88242',
    '#9f8c67',
    '#a6878a',
    '#649d7c',
    '#bf818c',
    '#7e95ae',
    '#859a69',
    '#b09655',
    '#5ca9b8',
    '#94a1a4',
    '#dca27b',
    '#e7aa58',
    '#d6b258',
    '#cdb0c1',
    '#8ac7d0',
    '#d8b2b1',
    '#cfbc76',
    '#c9bc94',
    '#b4c0c6',
    '#9ecaba',
    '#c2c1b6',
    '#eed06e',
    '#e8d890',
    '#e1d8aa',
    '#d0dbdd',
    '#e0dbc3',
    '#dcddd6',
];

export function getPlanetColours(size: number): string[] {
    const result: string[] = [];
    let pool: string[] = [];

    while (result.length < size) {
        if (pool.length === 0) {
            pool = [...COLOURS];
        }
        const index = Math.floor(Math.random() * pool.length);
        result.push(pool.splice(index, 1)[0]);
    }

    return result;
}
