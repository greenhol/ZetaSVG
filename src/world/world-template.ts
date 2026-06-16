import { InitializeAfterConstruct } from '../../shared';
import { ModuleConfig } from '../../shared/config';
import { ONE_DEGREE } from '../types/constants';
import { World, WorldConfig } from './world';

interface TemplateConfig extends WorldConfig {
    property: number;
}

@InitializeAfterConstruct()
export class WorldTemplate extends World {

    constructor() {
        super();
        // ToDo
    }

    override config = new ModuleConfig<TemplateConfig>(
        {
            cameraPerspective: {
                position: { x: -0, y: 0, z: -8.2 },
                angleX: 0 * ONE_DEGREE,
                angleY: 90 * ONE_DEGREE,
                angleZ: 0 * ONE_DEGREE,
                fov: 90,
                type: 'Orbit',
            },
            property: 1,
        },
        "templateConfig",
    );

    override backgroundColor: string = '#4488aa';

    public transitionToStateAt(t: number): void {
        // ToDo
    }
}
