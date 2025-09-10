import type { Handlers, FixedVhPolyfillInstance } from './types';
import { Utils } from './utils';

export const createHandlers = (instance: FixedVhPolyfillInstance): Handlers => {
    const DEBOUNCE_MS = instance.DEBOUNCE_MS;
    return {
        load: () => {
            instance.state.currentWidth = window.innerWidth;
            instance.refreshDimensions(true);
            const currentLvh = Utils.toPx('1lvh');
            const currentSvh = Utils.toPx('1svh');
            instance.state.lvhMeasurements.push(currentLvh);
            instance.state.svhMeasurements.push(currentSvh);
        },
        scroll: () => {
            if (instance.state.scrollTimeout) clearTimeout(instance.state.scrollTimeout);
            if (instance.state.touchScrollTimeout) clearTimeout(instance.state.touchScrollTimeout);
            instance.state.isScrolling = true;

            if (instance.state.isTouching) {
                instance.state.isTouchScrolling = true;
            } else {
                instance.state.touchScrollTimeout = window.setTimeout(() => {
                    instance.state.isTouchScrolling = false;
                }, DEBOUNCE_MS.TOUCH_SCROLL_END);
            }
            instance.state.scrollTimeout = window.setTimeout(() => {
                instance._measureAndCheck();
                instance.state.isScrolling = false;
            }, DEBOUNCE_MS.SCROLL_END);
        },
        touchStart: () => {
            if (instance.state.touchScrollTimeout) clearTimeout(instance.state.touchScrollTimeout);
            instance.state.isTouching = true;
        },
        touchEnd: () => {
            if (instance.state.touchScrollTimeout) clearTimeout(instance.state.touchScrollTimeout);
            instance.state.isTouching = false;
            instance.state.touchScrollTimeout = window.setTimeout(() => {
                instance.state.isTouchScrolling = false;
            }, DEBOUNCE_MS.TOUCH_SCROLL_END);
        },
        resize: () => {
            const newWidth = window.innerWidth;
            if (newWidth !== instance.state.currentWidth) {
                instance.state.currentWidth = newWidth;
                instance.refreshDimensions(true);
            } else {
                instance.refreshDimensions(false);
            }
        },
        orientation: () => {
            instance.state.currentWidth = window.innerWidth;
            instance.refreshDimensions(true);
        },
    };
}