// utils.ts
// Utility functions for stableScroll

/**
 * Caches the virtual element instance to prevent redundant DOM creation and ensure reuse.
 * This improves performance by maintaining a single element throughout the lifecycle.
 */
let cachedVirtualElement: HTMLElement | null = null;

/**
 * Creates and caches a virtual element for viewport calculations.
 * Ensures a single DOM element is reused to optimize performance.
 * @returns {HTMLElement} The cached or newly created virtual element.
 * @example
 * const element = createVirtualElement();
 */	
const createVirtualElement = (): HTMLElement => {
	if (cachedVirtualElement) {
		return cachedVirtualElement;
	}
	
	const virtualElement = document.createElement('div');
	virtualElement.id = 'stable-scroll-virtual-element';
	virtualElement.style.cssText = `
		position:absolute;top:0;left:0;width:0;height:0;pointer-events:none;content-visibility:hidden;
	`;
	document.body.appendChild(virtualElement);
	cachedVirtualElement = virtualElement;
	return virtualElement;
};

/**
 * Converts a CSS length value to pixels.
 * @param {string} cssValue - The CSS value to convert (e.g., '1lvh', '1svh').
 * @param {'computed' | 'offsetHeight'} [method='computed'] - Conversion method: 'computed' uses getComputedStyle, 'offsetHeight' uses offsetHeight.
 * @param {boolean} [isInt=false] - If true, returns a value rounded to the nearest tenth.
 * @returns {number} The pixel value.
 * @remarks Automatically creates and reuses a virtual element for measurement.
 * @example
 * const px = toPx('1lvh', 'computed', true);
 */
const toPx = (cssValue: string, method: 'computed' | 'offsetHeight' = 'computed', isInt: boolean = false): number => {
	if (!document.body) return 0;
	const virtualElement = createVirtualElement();
	virtualElement.style.height = cssValue;
	// Get the height using the specified method
	let value: number;
	if (method === 'computed') {
		value = parseFloat(getComputedStyle(virtualElement).height);
		return isInt ? Math.round(value * 10) / 10 : value;
	} else {
		return virtualElement.offsetHeight;
	}
};

export const Utils = {
    toPx,
};