export interface Handlers {
    load: () => void;
    scroll: () => void;
    touchStart: () => void;
    touchEnd: () => void;
    resize: () => void;
    orientation: () => void;
}
/**
 * Interface for FixedVhPolyfill state and core functionality.
 */
export interface FixedVhPolyfillState {
    lvh: number;
    svh: number;
    lvhPropertyName: string;
    svhPropertyName: string;
    scrollTimeout?: number;
    touchTimeout?: number;
    touchScrollTimeout?: number;
    resizeTimeout?: number;
    rAf: number | null;
    isTouchScrolling?: boolean;
    isScrolling?: boolean;
    isTouching?: boolean;
    virtualElement?: HTMLElement | null;
    isDetectionComplete: boolean;
    detectionCount: number;
    lvhMeasurements: number[];
    svhMeasurements: number[];
    isModuleNeeded: boolean | null;
}
export interface FixedVhPolyfillInstance {
    state: FixedVhPolyfillState;
    refreshDimensions: (force?: boolean) => void;
    updateViewportHeight: (force?: boolean) => void;
    initEventListener: () => void;
    setCustomProperties: (property: string, name: string) => void;
    init: (options?: {
        lvhPropertyName?: string;
        svhPropertyName?: string;
        debugMode?: boolean;
    }) => void;
    cleanup: () => void;
    clearTimeouts: () => void;
    _checkIfModuleIsNeeded: (force?: boolean) => void;
    _measureAndCheck: () => void;
    createDebugContainer: () => void;
    debug: () => void;
}
