export class RingBuffer<T> {
    private buffer: Array<T>;
    private head: number;
    private tail: number;
    private count: number;

    constructor(private readonly n: number) {
        this.buffer = new Array(n);
        this.head = 0;
        this.tail = 0;
        this.count = 0;
    }

    push(item: T): void {
        if (this.isFull()) {
            // Overwrite oldest item
            this.buffer[this.head] = item;
            this.head = (this.head + 1) % this.n;
            this.tail = (this.tail + 1) % this.n;
        } else {
            this.buffer[this.head] = item;
            this.head = (this.head + 1) % this.n;
            this.count++;
        }
    }

    isFull(): boolean {
        return this.count === this.n;
    }

    isEmpty(): boolean {
        return this.count === 0;
    }

    size(): number {
        return this.count;
    }

    get values(): T[] {
        const result: T[] = [];
        if (this.isEmpty()) {
            return result;
        }
        // Iterate from head-1 to tail (newest to oldest)
        for (let i = 0; i < this.count; i++) {
            const index = (this.head - 1 - i + this.n) % this.n;
            result.push(this.buffer[index]!);
        }
        return result;
    }
}
