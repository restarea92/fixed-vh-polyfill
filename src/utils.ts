// utils.ts
// Utility functions for stableScroll

/**
 * Creates a virtual element for viewport calculations.
 * @returns {HTMLElement} The created virtual element
 * @remarks Only one element is created and reused.
 * @example
 * const element = createVirtualElement();
 */
export const createVirtualElement = (): HTMLElement => {
	let virtualElement = document.querySelector('#stable-scroll-virtual-element') as HTMLElement | null;
	if (!virtualElement) {
		virtualElement = document.createElement('div');
		virtualElement.id = 'stable-scroll-virtual-element';
		virtualElement.style.cssText = `
			position:absolute;top:0;left:0;width:0;height:0;pointer-events:none;content-visibility:hidden;
		`;
		document.body.appendChild(virtualElement);
	}
	return virtualElement;
};

/**
 * Converts a CSS unit to px (integer).
 * @param {string} cssValue CSS value to convert (e.g., '1lvh', '1svh')
 * @param {'computed' | 'offsetHeight'} method Method to use for conversion ('computed' uses getComputedStyle, 'offsetHeight' uses offsetHeight) default is 'computed'
 * @param {boolean} isInt Return type ('float' for decimal, 'int' for integer) default is false
 * @returns {number} px value
 * @remarks Automatically creates/reuses the virtual element.
 * @example
 * const px = toPx('1lvh', 'computed', true);
 */
export const toPx = (cssValue: string, method: 'computed' | 'offsetHeight' = 'computed', isInt: boolean = false): number => {
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

/**
 * Detects if the device is iOS.
 * @returns {boolean} True if iOS, false otherwise
 * @remarks Uses user agent sniffing.
 */
export const isIOS = (): boolean => {
	return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
		(navigator.userAgent.includes('Macintosh') && 'ontouchend' in document);
};