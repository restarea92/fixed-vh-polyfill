import type {
  FixedVhPolyfillInstance,
  Handlers,
  DebounceTimes,
  FixedVhPolyfillState,
  FixedVhPolyfillOptions,
} from "./types";
import { Utils } from "./utils";
import { createHandlers } from "./handlers";
import { debugContainerHTML, statusHTMLTemplate } from "./templates";

/**
 * Debounce times in milliseconds for various events.
 * These values are crucial for determining the 'end' of a user action and preventing event storms.
 * - `SCROLL_END` & `TOUCH_SCROLL_END` (200ms): A standard, stable value to determine when a scroll action has finished.
 * - `RESIZE` (200ms): A shorter value for a more agile response to environmental changes like device orientation or window resizing.
 */
const DEBOUNCE_MS: DebounceTimes = {
  SCROLL_END: 200,
  TOUCH_END: 200,
  TOUCH_SCROLL_END: 200,
  RESIZE: 200,
} as const;

/**
 * StableScroll instance that provides stable viewport height values
 * and manages scroll-related state for better mobile experience
 */
export const state: FixedVhPolyfillState = {
  fvh: 0,
  lvh: 0,
  svh: 0,
  currentWidth: 0, // 너비 상태 추가

  fvhPropertyName: "--fvh",
  lvhPropertyName: "--lvh",
  svhPropertyName: "--svh",

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
export const FixedVhPolyfill: FixedVhPolyfillInstance = {
  /*
   * Current state of the FixedVhPolyfill instance
   */
  state,
  DEBOUNCE_MS,
  /**
   * Refreshes viewport height values and updates CSS variables.
   * @param force - Whether to force refresh immediately without debouncing
   * @returns void
   */
  refreshDimensions(force = false) {
    if (state.rAf) cancelAnimationFrame(state.rAf);
    if (state.resizeTimeout) clearTimeout(state.resizeTimeout);

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
    const newFvh = Utils.toPx("1vh");
    const newLvh = Utils.toPx("1lvh");
    const newSvh = Utils.toPx("1svh");

    const setVar = (property: string, value: number) => {
      document.documentElement.style.setProperty(property, `${value}px`);
      if (property === this.state.lvhPropertyName) this.state.lvh = value;
      if (property === this.state.svhPropertyName) this.state.svh = value;
      if (property === this.state.fvhPropertyName) this.state.fvh = value;
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
    if (
      this.state.isTouchScrolling ||
      this.state.isScrolling ||
      this.state.isTouching
    ) {
      FixedVhPolyfill._measureAndCheck();
      if (this.state.lvh < newLvh) {
        setVar(this.state.lvhPropertyName, newLvh);
      }
      if (this.state.svh === 0 || this.state.svh > newSvh) {
        setVar(this.state.svhPropertyName, newSvh);
      }
    }
    // during a scroll/touch action or when forced, to maximize stability.
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
        const storedIsModuleNeeded = localStorage.getItem(
          "fixedVhPolyfill_isModuleNeeded",
        );
        if (storedIsModuleNeeded !== null) {
          this.state.isDetectionComplete = true;
          const isNeeded = storedIsModuleNeeded === "true";
          this.state.isModuleNeeded = isNeeded;

          // If module is not needed based on stored value, perform cleanup and stop.
          if (!isNeeded) {
            this.cleanup();
          }
        } else {
          this.state.isModuleNeeded = null;
          // If no stored value, continue to the measurement logic below.
        }
        return; // Stop further execution
      }

      // This part will now only run if it's the first time (no localStorage value)
      // and the initial measurements are being taken.
      if (this.state.isDetectionComplete) return;

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
      localStorage.setItem(
        "fixedVhPolyfill_isModuleNeeded",
        String(this.state.isModuleNeeded),
      );

      // If the module is not needed, clean up the event listeners to save resources.
      if (!this.state.isModuleNeeded) {
        this.cleanup();
      }
    } catch (e) {
      console.warn("localStorage not available:", e);
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
    if (state.isDetectionComplete) return;

    const MAX_DETECTIONS = 10;
    const currentLvh = Utils.toPx("1lvh");
    const currentSvh = Utils.toPx("1svh");

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
    window.addEventListener("load", handlers.load);
    window.addEventListener("scroll", handlers.scroll);
    window.addEventListener("touchstart", handlers.touchStart);
    window.addEventListener("touchend", handlers.touchEnd);
    window.addEventListener("resize", handlers.resize);
    window.addEventListener("orientationchange", handlers.orientation);
  },

  /**
   * Sets custom CSS property names for viewport height variables.
   * @param property - The property type to set ('lvh' or 'svh')
   * @param name - Custom CSS property name (will be prefixed with '--' if not present)
   * @returns void
   */
  setCustomProperties(property: string, name: string) {
    const allowedProperty = ["fvh", "lvh", "svh"];
    if (!allowedProperty.includes(property)) return;
    if (!name.startsWith("-")) {
      name = `--${name}`;
    } else {
      if (!/^--[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(name)) {
        if (property === "fvh") {
          name = "--fvh";
        } else if (property === "lvh") {
          name = "--lvh";
        } else {
          name = "--svh";
        }
      }
    }
    if (property === "fvh") {
      this.state.fvhPropertyName = name;
    } else if (property === "lvh") {
      this.state.lvhPropertyName = name;
    } else if (property === "svh") {
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
  init(options: FixedVhPolyfillOptions = {}) {
    this.setCustomProperties(
      "fvh",
      options.fvhPropertyName || this.state.fvhPropertyName,
    );
    this.setCustomProperties(
      "lvh",
      options.lvhPropertyName || this.state.lvhPropertyName,
    );
    this.setCustomProperties(
      "svh",
      options.svhPropertyName || this.state.svhPropertyName,
    );
    this.initEventListener();
    this._checkIfModuleIsNeeded(true);
    if (options.debugMode) {
      this.setStateProxy();
      handlers = createHandlers(this); // Recreate handlers with the current instance.
      this.debug();
    }
  },

  /**
   * Removes all event listeners registered by stableScroll.
   * Call this method in SPAs or when destroying the instance to prevent memory leaks.
   * @returns void
   */
  cleanup() {
    window.removeEventListener("load", handlers.load);
    window.removeEventListener("scroll", handlers.scroll);
    window.removeEventListener("touchstart", handlers.touchStart);
    window.removeEventListener("touchend", handlers.touchEnd);
    window.removeEventListener("resize", handlers.resize);
    window.removeEventListener("orientationchange", handlers.orientation);
    this.clearTimeouts();
    document.documentElement.style.setProperty(
      this.state.lvhPropertyName,
      `1lvh`,
    );
    document.documentElement.style.setProperty(
      this.state.svhPropertyName,
      `1svh`,
    );
    document.documentElement.style.setProperty(
      this.state.fvhPropertyName,
      `1vh`,
    );
  },

  /**
   * Clears all active timeouts and resets timeout references.
   * @returns void
   */
  clearTimeouts() {
    if (this.state.scrollTimeout) clearTimeout(this.state.scrollTimeout);
    if (this.state.touchTimeout) clearTimeout(this.state.touchTimeout);
    if (this.state.touchScrollTimeout)
      clearTimeout(this.state.touchScrollTimeout);
    if (this.state.resizeTimeout) clearTimeout(this.state.resizeTimeout);
    if (this.state.rAf) cancelAnimationFrame(this.state.rAf);
    this.state.rAf = null;
    this.state.resizeTimeout = undefined;
    this.state.scrollTimeout = undefined;
    this.state.touchTimeout = undefined;
    this.state.touchScrollTimeout = undefined;
  },

  createDebugContainer() {
    const containerHTML = debugContainerHTML;
    if (!document.getElementById("log-container")) {
      document.body.insertAdjacentHTML("beforeend", containerHTML);
    }
  },

  log(message: string) {
    const logList = document.getElementById("log-list");
    if (!logList) return;
    const listItem = document.createElement("li");
    listItem.textContent = `${message}`;
    logList.appendChild(listItem);
    logList.scrollTop = logList.scrollHeight;
  },

  setStateProxy() {
    const selectedProp = "detectionCount";
    const renderStatusHTML = (state: FixedVhPolyfillState) => {
      let html = statusHTMLTemplate;
      Object.keys(state).forEach((key) => {
        const value = (state as any)[key];
        html = html.replace(new RegExp(`{{${key}}}`, "g"), String(value));
      });
      return html;
    };

    const updateStatus = () => {
      const status = document.getElementById("status");
      if (status) {
        status.innerHTML = renderStatusHTML(this.state);
      }
    };
    const stateProxy = new Proxy(this.state, {
      set: (target, prop, value) => {
        if (prop === selectedProp) {
          this.log(
            ` [${new Date().toLocaleTimeString()}] ${String(prop)} change: ${value}`,
          );
          this.log(` lvhMeasurements: [${this.state.lvhMeasurements}]`);
          this.log(` svhMeasurements: [${this.state.svhMeasurements}]`);
        }
        (target as any)[prop] = value;
        updateStatus();
        return true;
      },
    });
    this.state = stateProxy;
  },

  debug() {
    this.createDebugContainer();

    const logContainer = document.getElementById("log-container");
    const clearBtn = document.getElementById("local-storage-clear-btn");
    const closeBtn = document.getElementById("close-log-btn");
    const openBtn = document.getElementById("open-log-btn");

    closeBtn?.addEventListener("click", () =>
      logContainer?.classList.add("hide"),
    );
    clearBtn?.addEventListener("click", () => {
      window.localStorage.removeItem("fixedVhPolyfill_isModuleNeeded");
      window.location.reload();
    });
    openBtn?.addEventListener("click", () =>
      logContainer?.classList.remove("hide"),
    );

    window.addEventListener("load", () => {
      this.log(` [${new Date().toLocaleTimeString()}] Debug mode initialized.`);
      this.log(` needModule: ${this.state.isModuleNeeded}`);
      this.log(` lvhMeasurements: [${this.state.lvhMeasurements}]`);
      this.log(` svhMeasurements: [${this.state.svhMeasurements}]`);
    });
  },
};

let handlers: Handlers = createHandlers(FixedVhPolyfill);
