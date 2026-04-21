import { ConfigUiFieldCreator, UiFieldFloat } from '../../../shared/config';

class WorldConfigFieldCreator extends ConfigUiFieldCreator {

    /** Header */
    public readonly UI_FIELD_HEADER_PARAMETERS = this.createHeader('Parameters');
    public readonly UI_FIELD_HEADER_INITIAL_STATE = this.createHeader('Initial State');

    /** Pendulum */
    /** Parameters */
    public uiFieldL1(path: string): UiFieldFloat {
        return this.createFloatField(path, 'Length Arm 1', 'Length of first (upper) arm', 0.1, 10);
    }
    public uiFieldM1(path: string): UiFieldFloat {
        return this.createFloatField(path, 'Center Weight', 'Mass of first (center) weight', 0.1, 10);
    }
    public uiFieldL2(path: string): UiFieldFloat {
        return this.createFloatField(path, 'Length Arm 2', 'Length of second (lower) arm', 0.1, 10);
    }
    public uiFieldM2(path: string): UiFieldFloat {
        return this.createFloatField(path, 'Bottom Weight', 'Length of second (bottom) arm', 0.1, 10);
    }
    public uiFieldG(path: string): UiFieldFloat {
        return this.createFloatField(path, 'g', 'Gravitational constant', -10, 20);
    }
    public uiFieldFriction(path: string): UiFieldFloat {
        return this.createFloatField(path, 'Friction', 'Friction factor of the system (default 1: no friction)', 0.9, 1.1);
    }

    /** Initial State */
    public uiFieldTheta1(path: string): UiFieldFloat {
        return this.createFloatField(path, '\u03B8\u2081', 'theta 1', 0, 10);
    }
    public uiFieldPhi1(path: string): UiFieldFloat {
        return this.createFloatField(path, '\u03C6\u2081', 'ph1 1', 0, 10);
    }
    public uiFieldTheta2(path: string): UiFieldFloat {
        return this.createFloatField(path, '\u03B8\u2082', 'theta 2', 0, 10);
    }
    public uiFieldPhi2(path: string): UiFieldFloat {
        return this.createFloatField(path, '\u03C6\u2082', 'phi 2', 0, 10);
    }
    public uiFieldDtheta1(path: string): UiFieldFloat {
        return this.createFloatField(path, '\u2202\u03B8\u2081', 'diff theta 1', 0, 10);
    }
    public uiFieldDphi1(path: string): UiFieldFloat {
        return this.createFloatField(path, '\u2202\u03C6\u2081', 'diff phi 1', 0, 10);
    }
    public uiFieldDtheta2(path: string): UiFieldFloat {
        return this.createFloatField(path, '\u2202\u03B8\u2082', 'diff theta 2', 0, 10);
    }
    public uiFieldDphi2(path: string): UiFieldFloat {
        return this.createFloatField(path, '\u2202\u03C6\u2082', 'diff phi 2', 0, 10);
    }
}

export const CREATE = new WorldConfigFieldCreator();