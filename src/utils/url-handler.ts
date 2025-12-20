export class UrlHandler {

    private readonly worldIdParameter: string = 'worldId';

    getWorldId(): number | null {
        const hash = window.location.hash.substring(1);
        const parameters = new URLSearchParams(hash);
        return this.parseIntOrNull(parameters.get(this.worldIdParameter));
    }

    updateWorldId(id: number) {
        window.location.hash = `${this.worldIdParameter}=${encodeURIComponent(id)}`;
    }

    private parseIntOrNull(value: string | null): number | null {
        if (!value) return null;
        const num = Number(value);
        return isNaN(num) ? null : num;
    }
}


