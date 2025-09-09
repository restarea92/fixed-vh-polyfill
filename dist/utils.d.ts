/**
 * Creates a virtual element for viewport calculations.
 * @returns {HTMLElement} The created virtual element
 * @remarks Only one element is created and reused.
 * @example
 * const element = createVirtualElement();
 */
export declare const createVirtualElement: () => HTMLElement;
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
export declare const toPx: (cssValue: string, method?: "computed" | "offsetHeight", isInt?: boolean) => number;
