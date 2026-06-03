export enum StageMode {
    DEFAULT,
    SMALL,
    IMMERSIVE,
}

export namespace StageMode {

    export function evaluate(): StageMode {
        const isImmersive = window.innerWidth == screen.width && window.innerHeight == screen.height;
        if (isImmersive) { return StageMode.IMMERSIVE; }
        else if (window.innerWidth < 1300) { return StageMode.SMALL; }
        else { return StageMode.DEFAULT; }
    }

    export function getWidth(mode: StageMode): number {
        const devicePixelRatio = window.devicePixelRatio ?? 1;
        switch (mode) {
            case StageMode.DEFAULT: return 1280;
            case StageMode.SMALL: return 800;
            case StageMode.IMMERSIVE: return window.innerWidth * devicePixelRatio;
        }
    }

    export function getHeight(mode: StageMode): number {
        const devicePixelRatio = window.devicePixelRatio ?? 1;
        switch (mode) {
            case StageMode.DEFAULT: return 720;
            case StageMode.SMALL: return 450;
            case StageMode.IMMERSIVE: return window.innerHeight * devicePixelRatio;
        }
    }
}
