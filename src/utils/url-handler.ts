export class UrlHandler {

    private readonly worldIdParameter: string = 'worldId';

    getWorldId(): number | null {
        if (!window.location.hash) return null;
        const hash = window.location.hash.substring(1);
        const parameters = new URLSearchParams(hash);
        return this.parseIntOrNull(parameters.get(this.worldIdParameter));
    }

    updateWorldId(id: number) {
        const newHash = `${this.worldIdParameter}=${encodeURIComponent(id)}`;
        window.history.replaceState(null, "", `#${newHash}`);
    }

    private parseIntOrNull(value: string | null): number | null {
        if (!value) return null;
        const num = Number(value);
        return isNaN(num) ? null : num;
    }
}


