import type { FixedVhPolyfillInstance, FixedVhPolyfillState } from './types';
/**
 * StableScroll instance that provides stable viewport height values
 * and manages scroll-related state for better mobile experience
 */
export declare const state: FixedVhPolyfillState;
/**
 * FixedVhPolyfill instance that provides stable viewport height values
 * and manages scroll-related state for better mobile experience
 * @remarks
 * This instance is a singleton and should be initialized once.
 * Call `init()` to set up event listeners and start tracking viewport height.
 * Call `cleanup()` to remove event listeners when no longer needed.
 * @public
 */
export declare const FixedVhPolyfill: FixedVhPolyfillInstance;
