export function darkenColour(colour: string, factor: number): string {
    const colourRegex = /^#([0-9A-Fa-f]{3}){1,2}$/;
    if (!colourRegex.test(colour) || factor < 0 || factor > 1) {
        console.warn(`darkenColour - invalid inputs colour=${colour}, factor=${factor}`);
        return colour;
    }

    // Remove the '#' and expand shorthand hex (e.g., #abc to #aabbcc)
    let hex = colour.replace('#', '');
    if (hex.length === 3) {
        hex = hex.split('').map(c => c + c).join('');
    }

    // Parse the hex string into RGB components
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Darken each component by the factor
    const darkenedR = Math.round(r * factor);
    const darkenedG = Math.round(g * factor);
    const darkenedB = Math.round(b * factor);

    // Convert back to hex and pad with zeros if necessary
    const toHex = (value: number) => value.toString(16).padStart(2, '0');
    return `#${toHex(darkenedR)}${toHex(darkenedG)}${toHex(darkenedB)}`;
}
