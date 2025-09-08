import type { FixedVhPolyfillInstance, FixedVhPolyfillState, Handlers } from './types';
import { toPx } from './utils';

/**
 * Debounce times in milliseconds for various events.
 * These values are crucial for determining the 'end' of a user action and preventing event storms.
 * - `SCROLL_END` & `TOUCH_SCROLL_END` (300ms): A standard, stable value to determine when a scroll action has finished.
 * - `RESIZE` (100ms): A shorter value for a more agile response to environmental changes like device orientation or window resizing.
 */
const DEBOUNCE_MS = {
	SCROLL_END: 200,
	TOUCH_SCROLL_END: 200,
	RESIZE: 100,
} as const;

/**
 * Core logic for state management through raw event handlers.
 * The main purpose is to accurately infer an `isTouchScrolling` state, as browsers do not provide this natively.
 * It works by orchestrating `touch*` and `scroll` events, where higher-priority touch events
 * can cancel pending timeouts from scroll events. This "takeover" mechanism ensures the state is always
 * correctly reflecting the user's most recent action.
 */
const handlers: Handlers = {
	load: () => {
		FixedVhPolyfill.refreshDimensions(true);
		const state = FixedVhPolyfill.state;
		const currentLvh = toPx('1lvh');
		const currentSvh = toPx('1svh')
		state.lvhMeasurements.push(currentLvh);
		state.svhMeasurements.push(currentSvh);
	},
	scroll: () => {
		const state = FixedVhPolyfill.state;

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
			FixedVhPolyfill._measureAndCheck();
			state.isScrolling = false;
		}, DEBOUNCE_MS.SCROLL_END);
	},
	touchStart: () => {
		const state = FixedVhPolyfill.state;
		if (state.touchScrollTimeout) clearTimeout(state.touchScrollTimeout);
		state.isTouching = true;
	},
	touchEnd: () => {
		const state = FixedVhPolyfill.state;
		if (state.touchScrollTimeout) clearTimeout(state.touchScrollTimeout);
		state.isTouching = false;
		// 터치 스크롤이 끝났을 때만 측정
		if (state.isTouchScrolling) {
			FixedVhPolyfill._measureAndCheck();
			state.touchScrollTimeout = window.setTimeout(() => {
				state.isTouchScrolling = false;
			}, DEBOUNCE_MS.TOUCH_SCROLL_END);
		}
	},
	resize: () => {
		const state = FixedVhPolyfill.state;
		state.resizeTimeout = window.setTimeout(() => {
			FixedVhPolyfill.refreshDimensions();
		}, DEBOUNCE_MS.RESIZE);
	},
	orientation: () => {
		FixedVhPolyfill.refreshDimensions(true);
	},
	touchMove: () => {
		const state = FixedVhPolyfill.state;
		if (state.touchScrollTimeout) clearTimeout(state.touchScrollTimeout);
		state.isTouching = true;
	}
};

/**
 * StableScroll instance that provides stable viewport height values
 * and manages scroll-related state for better mobile experience
 */
export const state: FixedVhPolyfillState = {
	lvh: 0,
	svh: 0,
	lvhPropertyName: '--lvh',
	svhPropertyName: '--svh',
	resizeTimeout: null,
	scrollTimeout: undefined,
	touchScrollTimeout: undefined,
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
export const FixedVhPolyfill: FixedVhPolyfillInstance = {
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
			this.clearTimeouts();
			this.updateViewportHeight(true);
			return;
		}
		if (this.state.resizeTimeout) clearTimeout(this.state.resizeTimeout);
		this.state.resizeTimeout = window.setTimeout(() => {
			this.updateViewportHeight(false);
		}, DEBOUNCE_MS.RESIZE);
	},

	/**
	 * Updates the CSS variables for viewport height.
	 * @param force - Whether to force update regardless of scroll state
	 * @returns void
	 */
	updateViewportHeight(force = false) {
		const newLvh = toPx('1lvh');
		const newSvh = toPx('1svh');

		const setVar = (property: string, value: number) => {
			document.documentElement.style.setProperty(property, `${value}px`);
			if (property === this.state.lvhPropertyName) this.state.lvh = value;
			if (property === this.state.svhPropertyName) this.state.svh = value;
		};

		if (force) {
			setVar(this.state.lvhPropertyName, newLvh);
			setVar(this.state.svhPropertyName, newSvh);

			return;
		}
		// This is the core logic to prevent layout jank on mobile browsers.
		// During a scroll (especially on iOS), the browser's UI (like the address bar) can appear or disappear,
		// causing the viewport height to change. By only applying "safe" updates while scrolling,
		// we avoid the jarring visual flicker. "Safe" updates mean only allowing lvh to grow and
		// svh to shrink, which corresponds to the address bar hiding (more space) and showing (less space).
		if (this.state.isScrolling || this.state.isTouchScrolling) {

			if (this.state.lvh < newLvh) {
				setVar(this.state.lvhPropertyName, newLvh);
			}
			if (this.state.svh === 0 || this.state.svh > newSvh) {
				setVar(this.state.svhPropertyName, newSvh);
			}
		} else {
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
		const localStorage = window.localStorage;
		if (force) {
			const storedIsModuleNeeded = localStorage.getItem('fixedVhPolyfill_isModuleNeeded');
			if (storedIsModuleNeeded !== null) {
				this.state.isDetectionComplete = true;
				this.state.isModuleNeeded = storedIsModuleNeeded === 'true';
			} else {
				this.state.isModuleNeeded = null;
			}
			return;
		}

		const { lvhMeasurements, svhMeasurements } = this.state;
		const uniqueLvh = new Set(lvhMeasurements);
		const uniqueSvh = new Set(svhMeasurements);

		// If there's more than one unique value for either lvh or svh,
		// it means the viewport units are dynamic and the polyfill is needed.
		if (uniqueLvh.size > 1 || uniqueSvh.size > 1) {
			this.state.isModuleNeeded = true;
		} else {
			this.state.isModuleNeeded = false;
		}
		this.state.isDetectionComplete = true;
		localStorage.setItem('fixedVhPolyfill_isModuleNeeded', String(this.state.isModuleNeeded));

		// If the module is not needed, clean up the event listeners to save resources.
		if (!this.state.isModuleNeeded) {
			document.documentElement.style.setProperty(this.state.lvhPropertyName, `1lvh`);
			document.documentElement.style.setProperty(this.state.svhPropertyName, `1svh`);
			this.cleanup();
		}
	},
	/**
	 * Measures the current lvh and svh values and checks if the module is needed.
	 * This method is for internal use.
	 * @private
	 */
	_measureAndCheck() {
		const state = this.state;
		// 감지가 이미 완료되었다면 아무것도 하지 않습니다.
		if (state.isDetectionComplete) return;

		const MAX_DETECTIONS = 10;
		const currentLvh = toPx('1lvh');
		const currentSvh = toPx('1svh');

		state.lvhMeasurements.push(currentLvh);
		state.svhMeasurements.push(currentSvh);
		state.detectionCount++;

		// 측정 횟수가 최대치에 도달하면 최종 판정을 내립니다.
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
		window.addEventListener('touchmove', handlers.touchMove);
		window.addEventListener('resize', handlers.resize);
		window.addEventListener('orientationchange', handlers.orientation);
	},

	/**
	 * Sets custom CSS property names for viewport height variables.
	 * @param property - The property type to set ('lvh' or 'svh')
	 * @param name - Custom CSS property name (will be prefixed with '--' if not present)
	 * @returns void
	 */
	setCustomProperties(property: string, name: string) {
		const allowedProperty = ['lvh', 'svh'];
		if (!allowedProperty.includes(property)) return;
		if (!name.startsWith('-')) {
			name = `--${name}`;
		} else {
			if (!/^--[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(name)) {
				name = property === 'lvh' ? '--lvh' : '--svh';
			}
		}
		if (property === 'lvh') {
			this.state.lvhPropertyName = name;
		} else if (property === 'svh') {
			this.state.svhPropertyName = name;
		}
	},

	/**
	 * Initializes stableScroll and sets up event listeners.
	 * @param options - Configuration options
	 * @param options.lvhPropertyName - Custom CSS property name for large viewport height
	 * @param options.svhPropertyName - Custom CSS property name for small viewport height
	 * @returns void
	 */
	init(options = {}) {
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
		window.removeEventListener('scroll', handlers.scroll);
		window.removeEventListener('touchstart', handlers.touchStart);
		window.removeEventListener('touchend', handlers.touchEnd);
		window.removeEventListener('touchmove', handlers.touchMove);
		window.removeEventListener('resize', handlers.resize);
		window.removeEventListener('orientationchange', handlers.orientation);
	},

	/**
	 * Clears all active timeouts and resets timeout references.
	 * @returns void
	 */
	clearTimeouts() {
		if (this.state.resizeTimeout) clearTimeout(this.state.resizeTimeout);
		if (this.state.scrollTimeout) clearTimeout(this.state.scrollTimeout);
		if (this.state.touchScrollTimeout) clearTimeout(this.state.touchScrollTimeout);
		this.state.resizeTimeout = null;
		this.state.scrollTimeout = undefined;
		this.state.touchScrollTimeout = undefined;
	},

	createDebugContainer() {
		const containerHTML = `
		    <div id="log-container" style="position: fixed; bottom: 1rem; left: 1rem; background: rgba(0,0,0,0.8); color: white; padding: 1rem; border-radius: 10px; font-size: 0.5rem; z-index: 1000; width: 300px; height: 200px; overflow-x: clip; overflow-y: auto; font-family: monospace; display: flex; flex-direction: column; word-break: keep-all;">
				<h4 style="margin-bottom: 0.5rem; border-bottom: 1px solid #555; padding-bottom: 0.25rem;">Log</h4>
				<ul id="log-list" style="flex-grow: 1; overflow-y: auto; padding-right: 0.5rem;"></ul>
			</div>`;
		if (!document.getElementById('log-container')) {
			document.body.insertAdjacentHTML('beforeend', containerHTML);
		}
	},

	debug() {
		this.createDebugContainer();
		const logList = document.getElementById('log-list');
		if (!logList) return;
		const log = (message: string) => {
			const listItem = document.createElement('li');
			listItem.textContent = `${message}`;
			logList.appendChild(listItem);
			logList.scrollTop = logList.scrollHeight;
		}

		// proxy state
		const selectedProp = 'detectionCount'; // 원하는 프로퍼티명으로 변경
		const stateProxy = new Proxy(this.state, {
			set: (target, prop, value) => {
				if (prop === selectedProp) {
					log(` [${new Date().toLocaleTimeString()}] ${String(prop)} change: ${value}`);
					log(` lvhMeasurements: [${this.state.lvhMeasurements}]`);
					log(` svhMeasurements: [${this.state.svhMeasurements}]`);
				}
				if (prop === 'isModuleNeeded') {
					log(` [${new Date().toLocaleTimeString()}] ${String(prop)} change: ${value}`);
				}
				// @ts-ignore
				target[prop] = value;
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