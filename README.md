<div align="center">

# 📱 Fixed VH Polyfill

**A lightweight JavaScript utility to stabilize viewport height units (vh, svh, lvh) on iOS and prevent scroll jitter. Some iOS in-app browsers or non-Safari browsers may incorrectly interpret these units, causing layout issues. This module ensures consistent viewport sizing for mobile web apps affected by these quirks. (TypeScript)**
</div>

<br>

<div align="center">
  <a href="https://www.npmjs.com/package/fixed-vh-polyfill">
    <img src="https://img.shields.io/npm/v/fixed-vh-polyfill?style=for-the-badge&logo=npm&color=CB3837&logoColor=f6f9ff&labelColor=424656" alt="NPM Version">
  </a>
  <a href="https://github.com/restarea92/fixed-vh-polyfill/pulse">
    <img src="https://img.shields.io/github/last-commit/restarea92/fixed-vh-polyfill?style=for-the-badge&logo=github&color=71facb&logoColor=f6f9ff&labelColor=424656">
  </a>
  <a href="https://github.com/restarea92/fixed-vh-polyfill/actions/workflows/deploy-demo.yml">
    <img src="https://img.shields.io/github/actions/workflow/status/restarea92/fixed-vh-polyfill/deploy-demo.yml?branch=main&style=for-the-badge&label=build&logo=github&color=c6dbff&logoColor=f6f9ff&labelColor=424656" alt="Build Status">
  </a>
  <a href="https://github.com/restarea92/fixed-vh-polyfill/releases/latest">
    <img src="https://img.shields.io/github/v/release/restarea92/fixed-vh-polyfill?style=for-the-badge&logo=gitbook&color=c6dbff&logoColor=f6f9ff&labelColor=424656">
  </a>
</div>
<br>
<div align="center">
  <a href="https://restarea92.github.io/fixed-vh-polyfill/">
    <img src="https://img.shields.io/badge/Live_Demo-Click_Here-c6dbff?style=for-the-badge&logo=refinedgithub&logoColor=f6f9ff&labelColor=424656" alt="Live Demo">
  </a>
</div>
<br>
<div align="center">
<a href="https://opensource.org/licenses/MIT">
    <img src="https://img.shields.io/badge/license-MIT-50aaff?style=for-the-badge&logo=open-source-initiative&logoColor=f6f9ff&labelColor=424656" alt="License: MIT">
  </a>
</div>

<br>
Some iOS in-app browsers or non-Safari browsers may incorrectly interpret viewport units, causing layout jitter during scroll. This module provides stable viewport height units (like `--fvh`, `--lvh`, or `--svh`) via CSS Custom Properties to ensure consistent sizing for web apps affected by these quirks. It intelligently detects if it's needed and deactivates itself on modern browsers to save resources.


---

## ⚡ Quickstart

Install:
```bash
npm install fixed-vh-polyfill
```

ESM (recommended):
```javascript
import { FixedVhPolyfill } from 'fixed-vh-polyfill';

document.addEventListener('DOMContentLoaded', () => {
  FixedVhPolyfill.init();
});
```

CDN (module):
```html
<script type="module">
  import { FixedVhPolyfill } from 'https://cdn.jsdelivr.net/npm/fixed-vh-polyfill/+esm';
  document.addEventListener('DOMContentLoaded', () => FixedVhPolyfill.init());
</script>
```

CommonJS:
```javascript
const { FixedVhPolyfill } = require('fixed-vh-polyfill');
document.addEventListener('DOMContentLoaded', () => FixedVhPolyfill.init());
```
---

## 🪲 The Problems

- Some browsers have a dynamically changing viewport height due to UI elements like the address bar or on-screen keyboard. To address this, new units like `svh` and `lvh` were introduced.
- However, even in browsers that support `svh` and `lvh`, these units are sometimes interpreted dynamically (like `dvh`), not as fixed values.
- As a result, when UI elements (such as the address bar or bottom navigation) appear or disappear, the actual viewport height changes, and any element sized with viewport units (`vh`, `svh`, `lvh`) will also change height.
- **The main issue**: if this resize is triggered by a scroll event, elements above the scroll position (even those using `lvh` or `svh`) will change height, causing the total document height to shift. This can break scroll position and lead to unexpected behavior.
- This problem still affects many browsers, especially on iOS (e.g., Firefox for iOS, Arc for iOS, various in-app browsers, etc.).

---

## ✨ Features

-   **📏 Stable Viewport Units**: Provides CSS Custom Properties like `--fvh`, `--svh`, `--lvh` that aren't affected by browser UI changes.
-   **🧠 Smart Detection**: Automatically detects if it's needed by measuring viewport unit behavior across multiple events
-   **🤖 Self-Optimization**: If stable viewport units are detected, automatically cleans up and stops running to save resources
-   **💾 Intelligent Caching**: Detection results are cached in localStorage to avoid repeated measurements on subsequent visits
-   **⚡ Resource Efficient**: Only runs when actually needed, with minimal performance impact
-   **🪶 Lightweight**: Tiny and has zero dependencies.
-   **🧩 Easy Integration**: Simply import and initialize. It works automatically.
-   **🎨 Customizable**: Allows setting custom CSS variable names to avoid conflicts.
-   **🐞 Debug Mode**: Optional mode to monitor the polyfill's internal state.
-   **🖥️ Overlay Debug UI**: Enable a visual overlay to inspect the polyfill's behavior in real-time.

## 🚀 Getting Started

### 1. Installation

```bash
npm install fixed-vh-polyfill
```


### 2. Usage

Since this polyfill interacts with the DOM, it's important to initialize it **after** the DOM is fully loaded. Wrap the `init()` call inside a `DOMContentLoaded` event listener.

**ESM:**
```javascript
import { FixedVhPolyfill } from 'fixed-vh-polyfill';

document.addEventListener('DOMContentLoaded', () => {
  FixedVhPolyfill.init();
});
```

or via CDN:

```html
<script type="module">
    import { FixedVhPolyfill } from 'https://cdn.jsdelivr.net/npm/fixed-vh-polyfill/+esm';
    
    document.addEventListener('DOMContentLoaded', () => {
        FixedVhPolyfill.init();
    });
</script>
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

**Usage with React:**

```jsx
import { useEffect } from "react";
import { FixedVhPolyfill } from "fixed-vh-polyfill";

function App() {
  useEffect(() => {
    FixedVhPolyfill.init();
    // Optionally call cleanup on unmount in SPAs
    return () => FixedVhPolyfill.cleanup();
  }, []);

  return (
    <div className="fullscreen">
      {/* ... */}
    </div>
  );
}

export default App;
```

**Usage with Vuejs**

```jsx
<script setup>
import { onMounted, onBeforeUnmount } from "vue";
import { FixedVhPolyfill } from "fixed-vh-polyfill";

onMounted(() => {
  FixedVhPolyfill.init();
});
onBeforeUnmount(() => {
  FixedVhPolyfill.cleanup();
});
</script>

<template>
  <div class="fullscreen">
    <!-- ... -->
  </div>
</template>
```

> 💡 **Works perfectly in SPAs!**  
> Just call `init()` when your component mounts and `cleanup()` when it unmounts to avoid memory leaks.

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

The available CSS custom properties depend on your browser's viewport unit support:
- `--fvh`: Available in all browsers that support `vh` units
- `--lvh`, `--svh`: Available in browsers that support `lvh`/`svh` units (modern browsers)

```css
.fullscreen {
 /* fvh: Initial viewport height when page first loads
    - If page loads with address bar visible: similar to svh value
    - If page loads with address bar hidden: similar to lvh value
    - Provides consistent height regardless of subsequent UI changes */
 height: calc(100 * var(--fvh, 1vh));
}

.fullscreen.large {
 /* lvh: Fixed large viewport height (browser UI hidden)
    - Use when you want content to utilize full available space
    - Best for immersive experiences, fullscreen modals */
 height: calc(var(--lvh, 1lvh) * 100);
}

.fullscreen.small {
 /* svh: Fixed small viewport height (browser UI visible)
    - Use when content must always be fully visible
    - Best for critical UI, forms, navigation */
 height: calc(var(--svh, 1svh) * 100);
}

/* Progressive enhancement fallback strategy:
    1. Old browsers: 100vh (basic viewport height)
    2. Modern browsers supporting lvh/svh: 100lvh (native large viewport)
    3. All browsers: var(--lvh) (polyfilled stable version)
    Use this pattern for maximum browser compatibility */
.fullscreen.fallback {
    height: 100vh;                        /* fallback for very old browsers */
    height: 100lvh;                       /* native lvh for modern browsers */
    height: calc(100 * var(--lvh, 1lvh)); /* polyfilled stable version */
}
```
### When to use each unit:

- **`--fvh`**: General purpose stable viewport height, good for most use cases
- **`--lvh`** (Large Viewport Height): Use when you want content to fit the **full available space** when browser UI is hidden (typically after scrolling down)
- **`--svh`** (Small Viewport Height): Use when you want content to **always be visible** even when browser UI is shown (initial page load, scrolling up)

### Which Unit Should I Use?

| Unit | When to Use | Best For |
|------|-------------|----------|
| `--fvh` | General stable height | Main content, hero sections |
| `--lvh` | Maximum available space | Fullscreen modals, galleries |
| `--svh` | Always visible content | Navigation, forms, CTAs |

## 🐞 Debug Mode

When `debugMode` is set to `true` in the configuration, a small, draggable element will be added to the bottom-right of the screen. This element displays the real-time internal state of the polyfill, which is useful for visually confirming how the polyfill is operating on a target device.

Enable overlay debug UI:
```javascript
FixedVhPolyfill.init({ debugMode: true });
```


### Performance Impact
- **Lazy Detection**: Only 5 measurements needed
- **Debounced Updates**: 200ms debouncing prevents excessive updates  
- **Auto-Cleanup**: Removes listeners when not needed
- **Memory Efficient**: Uses requestAnimationFrame for smooth updates

---
---

## 🤝 License

This project is licensed under the **MIT License**.
