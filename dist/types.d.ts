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
    fvh: number;
    lvh: number;
    svh: number;
    currentWidth: number;
    fvhPropertyName: string;
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
export interface FixedVhPolyfillOptions {
    fvhPropertyName?: string;
    lvhPropertyName?: string;
    svhPropertyName?: string;
    debugMode?: boolean;
}
export interface DebounceTimes {
    SCROLL_END: number;
    TOUCH_END: number;
    TOUCH_SCROLL_END: number;
    RESIZE: number;
}
export interface FixedVhPolyfillInstance {
    state: FixedVhPolyfillState;
    DEBOUNCE_MS: DebounceTimes;
    setStateProxy: () => void;
    refreshDimensions: (force?: boolean) => void;
    updateViewportHeight: (force?: boolean) => void;
    initEventListener: () => void;
    setCustomProperties: (property: string, name: string) => void;
    init: (options?: FixedVhPolyfillOptions) => void;
    cleanup: () => void;
    clearTimeouts: () => void;
    _checkIfModuleIsNeeded: (force?: boolean) => void;
    _measureAndCheck: () => void;
    createDebugContainer: () => void;
    log: (...args: any[]) => void;
    debug: () => void;
}
