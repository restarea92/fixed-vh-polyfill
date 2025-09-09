<div align="center">

# 📱 Fixed VH Polyfill

**A lightweight JavaScript utility to stabilize viewport height units (vh, svh, lvh) on iOS and prevent scroll jitter. Some iOS in-app browsers or non-Safari browsers may incorrectly interpret these units, causing layout issues. This module ensures consistent viewport sizing for mobile web apps affected by these quirks. (TypeScript)**

</div>

<p align="center">
  <a href="https://www.npmjs.com/package/fixed-vh-polyfill">
    <img src="https://img.shields.io/npm/v/fixed-vh-polyfill.svg?style=for-the-badge" alt="NPM Version">
  </a>
  <a href="https://github.com/restarea92/fixed-vh-polyfill/actions/workflows/deploy-demo.yml">
    <img src="https://img.shields.io/github/actions/workflow/status/restarea92/fixed-vh-polyfill/deploy-demo.yml?branch=main&style=for-the-badge" alt="Build Status">
  </a>
  <a href="https://opensource.org/licenses/MIT">
    <img src="https://img.shields.io/npm/l/fixed-vh-polyfill?style=for-the-badge" alt="License">
  </a>
</p>

<p align="center">
  <a href="https://restarea92.github.io/fixed-vh-polyfill/">
    <img src="https://img.shields.io/badge/Live_Demo-Click_Here-2ea44f?style=for-the-badge" alt="Live Demo">
  </a>
</p>

Some iOS in-app browsers or non-Safari browsers may incorrectly interpret viewport units, causing layout jitter during scroll. This module provides stable viewport height units (like `--fvh`, `--lvh`, or `--svh`) via CSS Custom Properties to ensure consistent sizing for web apps affected by these quirks. It intelligently detects if it's needed and deactivates itself on modern browsers to save resources.

---

## ✨ Features

-   **📏 Stable Viewport Units**: Provides CSS Custom Properties like `--fvh`, `--svh`, `--lvh` that aren't affected by browser UI changes.
-   **🤖 Automatic Deactivation**: Intelligently disables itself on desktop or modern mobile browsers where it's not needed.
-   **🪶 Lightweight**: Tiny and has zero dependencies.
-   **🧩 Easy Integration**: Simply import and initialize. It works automatically.
-   **🎨 Customizable**: Allows setting custom CSS variable names to avoid conflicts.
-   **🐞 Debug Mode**: Optional mode to monitor the polyfill's internal state.

## 🚀 Getting Started

### 1. Installation

```bash
npm install fixed-vh-polyfill
```


### 2. Initialization

Since this polyfill interacts with the DOM, it's important to initialize it **after** the DOM is fully loaded. Wrap the `init()` call inside a `DOMContentLoaded` event listener.

**ESM:**
```javascript
import { FixedVhPolyfill } from 'fixed-vh-polyfill';

document.addEventListener('DOMContentLoaded', () => {
  FixedVhPolyfill.init();
});
```

**CJS (Node.js):**
```javascript
const { FixedVhPolyfill } = require('fixed-vh-polyfill');

// Ensure this code runs after the DOM is loaded if used in a browser context
document.addEventListener('DOMContentLoaded', () => {
  FixedVhPolyfill.init();
});
```

**UMD (Browser via CDN):**
```html
<script src="https://cdn.jsdelivr.net/npm/fixed-vh-polyfill/dist/index.umd.js"></script>
<script>
  document.addEventListener('DOMContentLoaded', () => {
    window.FixedVhPolyfill.init();
  });
</script>
```

---

## ⚙️ Configuration (Options)

You can pass an options object to the `init()` method to customize its behavior. Here is an example with all available options:

```javascript
document.addEventListener('DOMContentLoaded', () => {
  FixedVhPolyfill.init({
    // Custom CSS variable names
    fvhPropertyName: '--my-fixed-vh',
    lvhPropertyName: '--my-stable-lvh',
    svhPropertyName: '--my-stable-svh',

    // Enable debug mode
    debugMode: true
  });
});
```

### Available Options

| Option            | Type      | Default   | Description                                                                                             |
| :---------------- | :-------- | :-------- | :------------------------------------------------------------------------------------------------------ |
| `fvhPropertyName` | `string`  | `'--fvh'` | The CSS custom property for a stable `vh` unit, fixed to the viewport height at initial page load.      |
| `lvhPropertyName` | `string`  | `'--lvh'` | The CSS custom property for the stable "large viewport height" (`lvh`).                                 |
| `svhPropertyName` | `string`  | `'--svh'` | The CSS custom property for the stable "small viewport height" (`svh`).                                 |
| `debugMode`       | `boolean` | `false`   | When `true`, displays an overlay with the polyfill's internal state for debugging.                      |

## 🎨 Usage in CSS

Once initialized, use the configured CSS custom properties in your CSS. The value is `1/100` of the stable viewport height.

The `1vh`, `1lvh`, or `1svh` fallback ensures your layout remains sensible if the polyfill hasn't loaded or is disabled.

```css
.fullscreen-element {
  /* Use --fvh for a stable viewport height that doesn't change on scroll */
  height: calc(var(--fvh, 1vh) * 100);
}

.another-element {
  /* Or use your custom variable name if you set one */
  height: calc(var(--my-stable-svh, 1svh) * 50);
}
```

## 🐞 Debug Mode

When `debugMode` is set to `true` in the configuration, a small, draggable element will be added to the bottom-right of the screen. This element displays the real-time internal state of the polyfill, which is useful for visually confirming how the polyfill is operating on a target device.

## 🤝 License

This project is licensed under the **MIT License**.
