export class RingBufferSimple<T> {
    private buffer: T[];

    constructor(
        private readonly n: number,
        private readonly prefillWith: T | null = null,
    ) {
        if (prefillWith != null) {
            this.buffer = new Array(n).fill(structuredClone(prefillWith));
        } else {
            this.buffer = [];
        }
    }

    push(item: T): T[] {
        this.buffer.push(item);
        if (this.buffer.length > this.n) {
            this.buffer = this.buffer.slice(-this.n);
        }
        return this.buffer.slice().reverse();
    }

    get values(): T[] {
        return this.buffer.slice().reverse();
    }

    get size(): number {
        return this.buffer.length;
    }
}
