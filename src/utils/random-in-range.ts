export function randomInRange(base: number, delta: number): number {
    return base + (Math.random() * 2 * delta) - delta;
}