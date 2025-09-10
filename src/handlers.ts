import type { Handlers, FixedVhPolyfillInstance } from './types';
import { Utils } from './utils';

export const createHandlers = (instance: FixedVhPolyfillInstance): Handlers => {
    const DEBOUNCE_MS = instance.DEBOUNCE_MS;
    return {
        load: () => {
            const state = instance.state;
            state.currentWidth = window.innerWidth;
            instance.refreshDimensions(true);
            const currentLvh = Utils.toPx('1lvh');
            const currentSvh = Utils.toPx('1svh');
            state.lvhMeasurements.push(currentLvh);
            state.svhMeasurements.push(currentSvh);
        },
        scroll: () => {
            const state = instance.state;
            if (state.scrollTimeout) clearTimeout(state.scrollTimeout);
            if (state.touchScrollTimeout) clearTimeout(state.touchScrollTimeout);
            state.isScrolling = true;

            if (state.isTouching) {
                state.isTouchScrolling = true;
            } else {
                state.touchScrollTimeout = window.setTimeout(() => {
                    state.isTouchScrolling = false;
                }, DEBOUNCE_MS.TOUCH_SCROLL_END);
            }
            state.scrollTimeout = window.setTimeout(() => {
                instance._measureAndCheck();
                state.isScrolling = false;
            }, DEBOUNCE_MS.SCROLL_END);
        },
        touchStart: () => {
            const state = instance.state;
            if (state.touchScrollTimeout) clearTimeout(state.touchScrollTimeout);
            state.isTouching = true;
        },
        touchEnd: () => {
            const state = instance.state;
            if (state.touchScrollTimeout) clearTimeout(state.touchScrollTimeout);
            state.isTouching = false;
            state.touchScrollTimeout = window.setTimeout(() => {
                state.isTouchScrolling = false;
            }, DEBOUNCE_MS.TOUCH_SCROLL_END);
        },
        resize: () => {
            const state = instance.state;
            const newWidth = window.innerWidth;
            if (newWidth !== state.currentWidth) {
                state.currentWidth = newWidth;
                instance.refreshDimensions(true);
            } else {
                instance.refreshDimensions(false);
            }
        },
        orientation: () => {
            const state = instance.state;
            state.currentWidth = window.innerWidth;
            instance.refreshDimensions(true);
        },
    };
}