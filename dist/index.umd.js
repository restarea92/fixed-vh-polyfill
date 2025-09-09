(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.FixedVhPolyfill = {}));
})(this, (function (exports) { 'use strict';

	// utils.ts
	// Utility functions for stableScroll
	/**
	 * Creates a virtual element for viewport calculations.
	 * @returns {HTMLElement} The created virtual element
	 * @remarks Only one element is created and reused.
	 * @example
	 * const element = createVirtualElement();
	 */
	const createVirtualElement = () => {
	    let virtualElement = document.querySelector('#stable-scroll-virtual-element');
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
	const toPx = (cssValue, method = 'computed', isInt = false) => {
	    if (!document.body)
	        return 0;
	    const virtualElement = createVirtualElement();
	    virtualElement.style.height = cssValue;
	    // Get the height using the specified method
	    let value;
	    if (method === 'computed') {
	        value = parseFloat(getComputedStyle(virtualElement).height);
	        return isInt ? Math.round(value * 10) / 10 : value;
	    }
	    else {
	        return virtualElement.offsetHeight;
	    }
	};

	/**
	 * Debounce times in milliseconds for various events.
	 * These values are crucial for determining the 'end' of a user action and preventing event storms.
	 * - `SCROLL_END` & `TOUCH_SCROLL_END` (300ms): A standard, stable value to determine when a scroll action has finished.
	 * - `RESIZE` (300ms): A shorter value for a more agile response to environmental changes like device orientation or window resizing.
	 */
	const DEBOUNCE_MS = {
	    SCROLL_END: 300,
	    TOUCH_SCROLL_END: 300,
	    RESIZE: 300,
	};
	/**
	 * Core logic for the polyfill, implemented through raw event handlers.
	 * The main strategy is to differentiate between "intentional" and "unintentional" resize events.
	 * - An intentional resize (e.g., device rotation, window resizing) is detected by a change in `window.innerWidth`.
	 *   This triggers a full recalculation of all viewport units.
	 * - An unintentional resize (e.g., browser UI appearing/disappearing during a scroll) is detected when a `resize`
	 *   event fires but `window.innerWidth` remains the same. This triggers only "safe" updates to `lvh` and `svh`
	 *   to prevent layout jank, while preserving the user's scroll state.
	 */
	const handlers = {
	    load: () => {
	        const state = FixedVhPolyfill.state;
	        state.currentWidth = window.innerWidth; // Save initial width
	        FixedVhPolyfill.refreshDimensions(true);
	        const currentLvh = toPx('1lvh');
	        const currentSvh = toPx('1svh');
	        const currentFvh = toPx('1vh');
	        state.lvhMeasurements.push(currentLvh);
	        state.svhMeasurements.push(currentSvh);
	        document.documentElement.style.setProperty(state.fvhPropertyName, `${currentFvh}px`);
	        state.fvh = currentFvh;
	    },
	    scroll: () => {
	        const state = FixedVhPolyfill.state;
	        if (state.scrollTimeout)
	            clearTimeout(state.scrollTimeout);
	        if (state.touchScrollTimeout)
	            clearTimeout(state.touchScrollTimeout);
	        state.isScrolling = true;
	        if (state.isTouching) {
	            state.isTouchScrolling = true;
	        }
	        else {
	            state.touchScrollTimeout = window.setTimeout(() => {
	                state.isTouchScrolling = false;
	            }, DEBOUNCE_MS.TOUCH_SCROLL_END);
	        }
	        state.scrollTimeout = window.setTimeout(() => {
	            FixedVhPolyfill._measureAndCheck();
	            state.isScrolling = false;
	        }, DEBOUNCE_MS.SCROLL_END);
	    },
	    touchStart: () => {
	        const state = FixedVhPolyfill.state;
	        if (state.touchScrollTimeout)
	            clearTimeout(state.touchScrollTimeout);
	        state.isTouching = true;
	    },
	    touchEnd: () => {
	        const state = FixedVhPolyfill.state;
	        if (state.touchScrollTimeout)
	            clearTimeout(state.touchScrollTimeout);
	        state.isTouching = false;
	        state.touchScrollTimeout = window.setTimeout(() => {
	            state.isTouchScrolling = false;
	        }, DEBOUNCE_MS.TOUCH_SCROLL_END);
	    },
	    resize: () => {
	        // Handles viewport resize events, distinguishing between intentional and unintentional resizes.
	        const state = FixedVhPolyfill.state;
	        const newWidth = window.innerWidth;
	        if (newWidth !== state.currentWidth) {
	            // If the width changes, treat it as an intentional resize (e.g., device rotation, window resize).
	            state.currentWidth = newWidth;
	            FixedVhPolyfill.refreshDimensions(true);
	        }
	        else {
	            // If the width is the same, treat it as an unintentional resize (e.g., scroll-induced).
	            FixedVhPolyfill.refreshDimensions(false);
	        }
	    },
	    orientation: () => {
	        // Orientation change is always considered an intentional resize.
	        const state = FixedVhPolyfill.state;
	        state.currentWidth = window.innerWidth;
	        FixedVhPolyfill.refreshDimensions(true);
	    },
	};
	/**
	 * StableScroll instance that provides stable viewport height values
	 * and manages scroll-related state for better mobile experience
	 */
	const state = {
	    fvh: 0,
	    lvh: 0,
	    svh: 0,
	    currentWidth: 0, // 너비 상태 추가
	    fvhPropertyName: '--fvh',
	    lvhPropertyName: '--lvh',
	    svhPropertyName: '--svh',
	    rAf: null,
	    scrollTimeout: undefined,
	    touchTimeout: undefined,
	    touchScrollTimeout: undefined,
	    resizeTimeout: undefined,
	    isScrolling: false,
	    isTouching: false,
	    isTouchScrolling: false,
	    virtualElement: null,
	    isDetectionComplete: false,
	    detectionCount: 0,
	    lvhMeasurements: [],
	    svhMeasurements: [],
	    isModuleNeeded: null,
	};
	/**
	 * FixedVhPolyfill instance that provides stable viewport height values
	 * and manages scroll-related state for better mobile experience
	 * @remarks
	 * This instance is a singleton and should be initialized once.
	 * Call `init()` to set up event listeners and start tracking viewport height.
	 * Call `cleanup()` to remove event listeners when no longer needed.
	 * @public
	 */
	const FixedVhPolyfill = {
	    /*
	     * Current state of the FixedVhPolyfill instance
	    */
	    state,
	    /**
	     * Refreshes viewport height values and updates CSS variables.
	     * @param force - Whether to force refresh immediately without debouncing
	     * @returns void
	     */
	    refreshDimensions(force = false) {
	        if (force) {
	            if (!state.isDetectionComplete) {
	                state.detectionCount = 0;
	                state.lvhMeasurements = [];
	                state.svhMeasurements = [];
	            }
	            clearTimeout(this.state.resizeTimeout);
	            this.updateViewportHeight(true);
	            return;
	        }
	        if (state.rAf)
	            cancelAnimationFrame(state.rAf);
	        if (state.resizeTimeout)
	            clearTimeout(state.resizeTimeout);
	        state.resizeTimeout = window.setTimeout(() => {
	            this.updateViewportHeight(false);
	        }, DEBOUNCE_MS.RESIZE);
	    },
	    /**
	     * Updates the CSS variables for viewport height.
	     * @param force - Whether to force update regardless of scroll state
	     * @returns void
	     */
	    updateViewportHeight(force = false) {
	        const newFvh = toPx('1vh');
	        const newLvh = toPx('1lvh');
	        const newSvh = toPx('1svh');
	        const setVar = (property, value) => {
	            document.documentElement.style.setProperty(property, `${value}px`);
	            if (property === this.state.lvhPropertyName)
	                this.state.lvh = value;
	            if (property === this.state.svhPropertyName)
	                this.state.svh = value;
	            if (property === this.state.fvhPropertyName)
	                this.state.fvh = value;
	        };
	        if (force) {
	            setVar(this.state.lvhPropertyName, newLvh);
	            setVar(this.state.svhPropertyName, newSvh);
	            setVar(this.state.fvhPropertyName, newFvh);
	            return;
	        }
	        // This is the core logic to prevent layout jank on mobile browsers.
	        // During a scroll (especially on iOS), the browser's UI (like the address bar) can appear or disappear,
	        // causing the viewport height to change. By only applying "safe" updates while scrolling,
	        // we avoid the jarring visual flicker. "Safe" updates mean only allowing lvh to grow and
	        // svh to shrink, which corresponds to the address bar hiding (more space) and showing (less space).
	        if (this.state.isTouchScrolling || this.state.isScrolling || this.state.isTouching) {
	            FixedVhPolyfill._measureAndCheck();
	            if (this.state.lvh < newLvh) {
	                setVar(this.state.lvhPropertyName, newLvh);
	            }
	            if (this.state.svh === 0 || this.state.svh > newSvh) {
	                setVar(this.state.svhPropertyName, newSvh);
	            }
	        }
	        else {
	            setVar(this.state.lvhPropertyName, newLvh);
	            setVar(this.state.svhPropertyName, newSvh);
	        }
	    },
	    /**
	     * Checks if the polyfill is needed by analyzing collected viewport height measurements.
	     * This method is for internal use.
	     * @private
	     */
	    _checkIfModuleIsNeeded(force = false) {
	        try {
	            const localStorage = window.localStorage;
	            if (force) {
	                const storedIsModuleNeeded = localStorage.getItem('fixedVhPolyfill_isModuleNeeded');
	                if (storedIsModuleNeeded !== null) {
	                    this.state.isDetectionComplete = true;
	                    const isNeeded = storedIsModuleNeeded === 'true';
	                    this.state.isModuleNeeded = isNeeded;
	                    // If module is not needed based on stored value, perform cleanup and stop.
	                    if (!isNeeded) {
	                        this.cleanup();
	                    }
	                }
	                else {
	                    this.state.isModuleNeeded = null;
	                    // If no stored value, continue to the measurement logic below.
	                }
	                return; // Stop further execution
	            }
	            // This part will now only run if it's the first time (no localStorage value)
	            // and the initial measurements are being taken.
	            if (this.state.isDetectionComplete)
	                return;
	            const { lvhMeasurements, svhMeasurements } = this.state;
	            const uniqueLvh = new Set(lvhMeasurements);
	            const uniqueSvh = new Set(svhMeasurements);
	            // If there's more than one unique value for either lvh or svh,
	            // it means the viewport units are dynamic and the polyfill is needed.
	            if (uniqueLvh.size > 1 || uniqueSvh.size > 1) {
	                this.state.isModuleNeeded = true;
	            }
	            else {
	                this.state.isModuleNeeded = false;
	            }
	            this.state.isDetectionComplete = true;
	            localStorage.setItem('fixedVhPolyfill_isModuleNeeded', String(this.state.isModuleNeeded));
	            // If the module is not needed, clean up the event listeners to save resources.
	            if (!this.state.isModuleNeeded) {
	                this.cleanup();
	            }
	        }
	        catch (e) {
	            console.warn('localStorage not available:', e);
	            // Fallback: assume module is needed if localStorage fails
	            this.state.isModuleNeeded = true;
	            this.state.isDetectionComplete = true;
	        }
	    },
	    /**
	     * Measures the current lvh and svh values and checks if the module is needed.
	     * This method is for internal use.
	     * @private
	     */
	    _measureAndCheck() {
	        const state = this.state;
	        if (state.isDetectionComplete)
	            return;
	        const MAX_DETECTIONS = 10;
	        const currentLvh = toPx('1lvh');
	        const currentSvh = toPx('1svh');
	        state.lvhMeasurements.push(currentLvh);
	        state.svhMeasurements.push(currentSvh);
	        state.detectionCount++;
	        if (state.detectionCount >= MAX_DETECTIONS) {
	            this._checkIfModuleIsNeeded();
	        }
	    },
	    /**
	     * Initializes scroll, touch, and resize event listeners.
	     * @returns void
	     */
	    initEventListener() {
	        window.addEventListener('load', handlers.load);
	        window.addEventListener('scroll', handlers.scroll);
	        window.addEventListener('touchstart', handlers.touchStart);
	        window.addEventListener('touchend', handlers.touchEnd);
	        window.addEventListener('resize', handlers.resize);
	        window.addEventListener('orientationchange', handlers.orientation);
	    },
	    /**
	     * Sets custom CSS property names for viewport height variables.
	     * @param property - The property type to set ('lvh' or 'svh')
	     * @param name - Custom CSS property name (will be prefixed with '--' if not present)
	     * @returns void
	     */
	    setCustomProperties(property, name) {
	        const allowedProperty = ['fvh', 'lvh', 'svh'];
	        if (!allowedProperty.includes(property))
	            return;
	        if (!name.startsWith('-')) {
	            name = `--${name}`;
	        }
	        else {
	            if (!/^--[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(name)) {
	                if (property === 'fvh') {
	                    name = '--fvh';
	                }
	                else if (property === 'lvh') {
	                    name = '--lvh';
	                }
	                else {
	                    name = '--svh';
	                }
	            }
	        }
	        if (property === 'fvh') {
	            this.state.fvhPropertyName = name;
	        }
	        else if (property === 'lvh') {
	            this.state.lvhPropertyName = name;
	        }
	        else if (property === 'svh') {
	            this.state.svhPropertyName = name;
	        }
	    },
	    /**
	     * Initializes stableScroll and sets up event listeners.
	     * @param options - Configuration options
	     * @param options.debugMode - Whether to enable debug mode (default: false)
	     * @param options.fvhPropertyName - Custom CSS property name for fixed viewport height
	     * @param options.lvhPropertyName - Custom CSS property name for large viewport height
	     * @param options.svhPropertyName - Custom CSS property name for small viewport height
	     * @returns void
	     */
	    init(options = {}) {
	        this.setCustomProperties('fvh', options.fvhPropertyName || this.state.fvhPropertyName);
	        this.setCustomProperties('lvh', options.lvhPropertyName || this.state.lvhPropertyName);
	        this.setCustomProperties('svh', options.svhPropertyName || this.state.svhPropertyName);
	        this.initEventListener();
	        this._checkIfModuleIsNeeded(true);
	        if (options.debugMode) {
	            this.debug();
	        }
	    },
	    /**
	     * Removes all event listeners registered by stableScroll.
	     * Call this method in SPAs or when destroying the instance to prevent memory leaks.
	     * @returns void
	     */
	    cleanup() {
	        window.removeEventListener('load', handlers.load);
	        window.removeEventListener('scroll', handlers.scroll);
	        window.removeEventListener('touchstart', handlers.touchStart);
	        window.removeEventListener('touchend', handlers.touchEnd);
	        window.removeEventListener('resize', handlers.resize);
	        window.removeEventListener('orientationchange', handlers.orientation);
	        this.clearTimeouts();
	        document.documentElement.style.setProperty(this.state.lvhPropertyName, `1lvh`);
	        document.documentElement.style.setProperty(this.state.svhPropertyName, `1svh`);
	        document.documentElement.style.setProperty(this.state.fvhPropertyName, `1vh`);
	    },
	    /**
	     * Clears all active timeouts and resets timeout references.
	     * @returns void
	     */
	    clearTimeouts() {
	        if (this.state.scrollTimeout)
	            clearTimeout(this.state.scrollTimeout);
	        if (this.state.touchTimeout)
	            clearTimeout(this.state.touchTimeout);
	        if (this.state.touchScrollTimeout)
	            clearTimeout(this.state.touchScrollTimeout);
	        if (this.state.resizeTimeout)
	            clearTimeout(this.state.resizeTimeout);
	        if (this.state.rAf)
	            cancelAnimationFrame(this.state.rAf);
	        this.state.rAf = null;
	        this.state.resizeTimeout = undefined;
	        this.state.scrollTimeout = undefined;
	        this.state.touchTimeout = undefined;
	        this.state.touchScrollTimeout = undefined;
	    },
	    createDebugContainer() {
	        const containerHTML = `
		    <div id="log-container">
				<h4 style="margin-top:1rem; margin-bottom: 0.5rem; border-bottom: 1px solid #555; padding-bottom: 0.25rem;">State</h4>
				<div id="status" style="display: flex; flex-direction: column; font-size: 0.6rem; margin-top: 0.5rem; gap: 0.2rem; background: rgba(255, 255, 255, 0.25); padding: 0.5rem; border-radius: 5px;">
					<span>isModuleNeeded: ${this.state.isModuleNeeded}</span>
					<span>isDetectionComplete: ${this.state.isDetectionComplete}</span>
					<span>isTouching: ${this.state.isTouching}</span>
					<span>isTouchScrolling: ${this.state.isTouchScrolling}</span>
					<span>isScrolling: ${this.state.isScrolling}</span>
					<span>fvh: ${this.state.fvh}</span>
					<span>lvh: ${this.state.lvh}</span>
					<span>svh: ${this.state.svh}</span>
				</div>
				<h4 style="margin-top:1rem; margin-bottom: 0.5rem; border-bottom: 1px solid #555; padding-bottom: 0.25rem;">Log</h4>
				<ul id="log-list" style="flex-grow: 1; overflow-y: auto; padding-right: 0.5rem; display:flex; flex-direction:column;"></ul>
				<button id="local-storage-clear-btn"">Clear localStorage</button>
				<button id="close-log-btn">Close</button>
				<button id="open-log-btn">Log</button>
			</div>
			
			<style>
				#log-container {
					position: fixed; bottom: 1rem; right: 1rem; background: rgba(0,0,0,0.8); color: white; padding: 1rem; border-radius: 10px; font-size: 0.5rem; z-index: 1000; width: 50%; height: calc(75 * var(--svh, 1vh)); overflow-x: clip; overflow-y: auto; font-family: monospace; display: flex; flex-direction: column; word-break: keep-all; display :flex; flex-direction: column
					button { background: #555; color: white; cursor: pointer;   font-size: 0.5rem; }
					button#close-log-btn { position:absolute; top: 0.5rem; right: 0.5rem; padding: 0.25rem 0.5rem; font-size: 0.5rem; border: none; border-radius: 5px; background: #555; color: white; cursor: pointer;}
					button#open-log-btn { background: transparent; display:none; position:absolute; top:0; left:0; width:100%; height:100%; align-items: center; justify-content: center;}
					button#local-storage-clear-btn { padding: 0.25rem 0.5rem;border: none; border-radius: 5px; }
					&.hide {
					 width: 2rem; height: 2rem; padding: 0; border-radius: 50%;
					 > * { opacity: 0; padding: 0; margin: 0; height: 0; overflow: hidden; }
					 > button#open-log-btn { display: flex; opacity: 1;  position: absolute; top: 0; right: 0; width: 100%; height: 100%; border-radius: 50%; }
					}
				}
			</style>
		`;
	        if (!document.getElementById('log-container')) {
	            document.body.insertAdjacentHTML('beforeend', containerHTML);
	        }
	        const clearBtn = document.getElementById('local-storage-clear-btn');
	        const closeBtn = document.getElementById('close-log-btn');
	        const openBtn = document.getElementById('open-log-btn');
	        const logContainer = document.getElementById('log-container');
	        if (closeBtn) {
	            closeBtn.addEventListener('click', () => {
	                const logContainer = document.getElementById('log-container');
	                if (logContainer) {
	                    logContainer.classList.add('hide');
	                }
	            });
	        }
	        if (clearBtn) {
	            clearBtn.addEventListener('click', () => {
	                window.localStorage.removeItem('fixedVhPolyfill_isModuleNeeded');
	                window.location.reload();
	            });
	        }
	        openBtn === null || openBtn === void 0 ? void 0 : openBtn.addEventListener('click', () => {
	            if (logContainer === null || logContainer === void 0 ? void 0 : logContainer.classList.contains('hide')) {
	                logContainer === null || logContainer === void 0 ? void 0 : logContainer.classList.remove('hide');
	            }
	        });
	    },
	    debug() {
	        this.createDebugContainer();
	        const logList = document.getElementById('log-list');
	        if (!logList)
	            return;
	        const log = (message) => {
	            const listItem = document.createElement('li');
	            listItem.textContent = `${message}`;
	            logList.appendChild(listItem);
	            logList.scrollTop = logList.scrollHeight;
	        };
	        const updateStatus = () => {
	            const status = document.getElementById('status');
	            if (status) {
	                status.innerHTML = `
					<span>isModuleNeeded: ${this.state.isModuleNeeded}</span>
					<span>isDetectionComplete: ${this.state.isDetectionComplete}</span>
					<span>isTouching: ${this.state.isTouching}</span>
					<span>isTouchScrolling: ${this.state.isTouchScrolling}</span>
					<span>isScrolling: ${this.state.isScrolling}</span>
					<span>fvh: ${this.state.fvh}</span>
					<span>lvh: ${this.state.lvh}</span>
					<span>svh: ${this.state.svh}</span>
				`;
	            }
	        };
	        // proxy state
	        const selectedProp = 'detectionCount';
	        const stateProxy = new Proxy(this.state, {
	            set: (target, prop, value) => {
	                if (prop === selectedProp) {
	                    log(` [${new Date().toLocaleTimeString()}] ${String(prop)} change: ${value}`);
	                    log(` lvhMeasurements: [${this.state.lvhMeasurements}]`);
	                    log(` svhMeasurements: [${this.state.svhMeasurements}]`);
	                }
	                log(` [${new Date().toLocaleTimeString()}] ${String(prop)} change: ${value}`);
	                target[prop] = value;
	                updateStatus();
	                return true;
	            }
	        });
	        this.state = stateProxy;
	        window.addEventListener('load', () => {
	            log(` [${new Date().toLocaleTimeString()}] Debug mode initialized.`);
	            log(` needModule: ${this.state.isModuleNeeded}`);
	            log(` lvhMeasurements: [${this.state.lvhMeasurements}]`);
	            log(` svhMeasurements: [${this.state.svhMeasurements}]`);
	        });
	    }
	};

	exports.FixedVhPolyfill = FixedVhPolyfill;
	exports.state = state;

}));
//# sourceMappingURL=index.umd.js.map
