import { WorldId, WorldType } from '../world/world-type';

export class UrlHandler {

    private readonly worldIdParameter: string = 'worldId';

    public getWorldId(): WorldId | null {
        if (!window.location.hash) return null;
        const hash = window.location.hash.substring(1);
        const parameters = new URLSearchParams(hash);
        const worldId = parameters.get(this.worldIdParameter) as WorldId | null;
        if (worldId == null) return null;
        const realm = WorldType.getRealm(worldId);
        if (realm == null) return null;
        return worldId;
    }

    public setWorld(worldId: WorldId) {
        const newHash = `${this.worldIdParameter}=${encodeURIComponent(worldId)}`;
        window.history.replaceState(null, "", `#${newHash}`);
    }
}
