export enum StageMode {
    DEFAULT,
    SMALL,
    IMMERSIVE,
}

export function evaluateStageProperties(): StageMode {
    // const devicePixelRatio = window.devicePixelRatio ?? 1;
    // const width = window.innerWidth * devicePixelRatio;
    // const height = window.innerHeight * devicePixelRatio;
    // console.log(`#evaluateStageProperties - window.devicePixelRatio=${window.devicePixelRatio}`);
    // console.log(`#evaluateStageProperties - window=${window.innerWidth} x ${window.innerHeight}`);
    // console.log(`#evaluateStageProperties - device=${width} x ${height}`);
    // console.log(`#evaluateStageProperties - screen=${screen.width} x ${screen.height}`);

    const isImmersive = window.innerWidth == screen.width && window.innerHeight == screen.height;
    if (isImmersive) { return StageMode.IMMERSIVE }
    else if (window.innerWidth < 1300) { return StageMode.SMALL }
    else { return StageMode.DEFAULT }
}

export function stageModeWidth(mode: StageMode): number {
    const devicePixelRatio = window.devicePixelRatio ?? 1;
    switch (mode) {
        case StageMode.DEFAULT: return 1280;
        case StageMode.SMALL: return 800;
        case StageMode.IMMERSIVE: return window.innerWidth * devicePixelRatio;
    }
}

export function stageModeHeight(mode: StageMode): number {
    const devicePixelRatio = window.devicePixelRatio ?? 1;
    switch (mode) {
        case StageMode.DEFAULT: return 720;
        case StageMode.SMALL: return 450;
        case StageMode.IMMERSIVE: return window.innerHeight * devicePixelRatio;
    }
}