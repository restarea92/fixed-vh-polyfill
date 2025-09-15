
<div align="center">

# 📱 Fixed VH Polyfill
**A lightweight JavaScript/TypeScript utility that stabilizes viewport height units (`vh`, `svh`, `lvh`) across browsers, preventing unintended reflows and scroll jitter.**

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
  <br>
  <b>👉 <a href="https://restarea92.github.io/fixed-vh-polyfill/">Check out the Live Demo</a> to see it in action! 🚀</b>
</div>
<br>
<div align="center">
<a href="https://opensource.org/licenses/MIT">
    <img src="https://img.shields.io/badge/license-MIT-50aaff?style=for-the-badge&logo=open-source-initiative&logoColor=f6f9ff&labelColor=424656" alt="License: MIT">
  </a>
</div>
<br>

</div>
<br>

This tool provides **consistent viewport-relative unit values** for mobile web apps, preventing unintended **reflows and scroll jitter** with minimal setup.

---

## ⚡ Quick start

### 📦 Installation
```bash
npm install fixed-vh-polyfill
```

### 📝 Usage
```javascript
import { FixedVhPolyfill } from 'fixed-vh-polyfill';
document.addEventListener('DOMContentLoaded', () => FixedVhPolyfill.init());
```

### 🎨 CSS
```css
.fullscreen {
  height: calc(100 * var(--fvh, 1vh));
}
```

<br>

## 🛑 The Problem & Solution

### What's the Problem?
- The `vh` unit is a CSS unit relative to the viewport height. However, different browsers interpret viewport height differently when UI elements like the address bar appear or disappear, which can cause unintended reflows and scroll jitter.
- On mobile devices, the viewport height can also be affected by the visibility of the keyboard, depending on the OS or browser version.
- Since 2022, `svh` and `lvh` units were introduced to address some of these issues. Yet, some browsers still have inconsistencies. For example, while Safari on the latest iOS works correctly, certain in-app or third-party WebKit-based browsers do not reliably interpret `svh` and `lvh`.
- Additionally, there are various edge cases across different devices and environments.

### How Fixed VH Polyfill Solves This
- Ensures **consistent values for viewport-relative units**.
- Prevents unintended **reflows and scroll jitter**.
- Automatically detects whether it’s needed and enables/disables itself to avoid unnecessary resource usage.

<br>

## 🤔 Why Fixed VH Polyfill?

### ✨ Key Features & Advantages
- 🌟 **Supports modern units:** Unlike traditional polyfills, it ensures consistent behavior for `lvh` and `svh`, accurately reflecting your web app design intentions. For example, use `svh` to guarantee content fully fits within the viewport.
- 🤖 **Intelligent Self-Optimization:** Measures viewport unit behavior across multiple events to determine if it’s actually needed. Once stable viewport units are detected, it automatically cleans up and stops running to save resources.
- ⚡ **Resource Efficient:** Only runs when necessary, with minimal performance impact.
- 🪶 **Lightweight:** Small footprint with zero dependencies.
- 🔌 **Easy Integration:** Simply import and initialize—it works automatically.
- 🖌️ **Customizable:** Allows custom CSS variable names to prevent conflicts.
- 🌐 **Broad Compatibility:** Works across all modern browsers, including mobile.
- 🪄 **SPA Friendly:** Provides a cleanup method to avoid memory leaks in SPA rendering environments.

<br>

---

<br>

## 🚀 Getting Started

### 📦 Installation

```bash
npm install fixed-vh-polyfill
```

### 📝 Usage
Since this polyfill interacts with the DOM, it's important to initialize it **after** the DOM is fully loaded. Wrap the `init()` call inside a `DOMContentLoaded` event listener.

#### 1. Initialization Examples:
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

<br>


#### 2. In HTML/CSS:

Once initialized, use the configured CSS custom properties in your CSS. The value is `1/100` of the stable viewport height.

The `1vh`, `1lvh`, or `1svh` fallback ensures your layout remains sensible if the polyfill hasn't loaded or is disabled.

The available CSS custom properties depend on your browser's viewport unit support:
- `--fvh`: Available in all browsers that support `vh` units

  ```css
  .fullscreen {
  /* fvh: Initial viewport height when page first loads */
  height: calc(100 * var(--fvh, 1vh));
  }
  ```

- `--lvh`, `--svh`: Available in browsers that support `lvh`/`svh` units (modern browsers)

  ```css
  .fullscreen.large {
  /* lvh: Fixed large viewport height (browser UI hidden) */
  height: calc(var(--lvh, 1lvh) * 100);
  }
  ```

  ```css
  .fullscreen.small {
  /* svh: Fixed small viewport height (browser UI visible) */
  height: calc(var(--svh, 1svh) * 100);
  }
  ```

**Progressive Enhancement**
- Fallback Strategy:

  ```css
  /* Use this pattern for maximum browser compatibility */
  .fullscreen.fallback {
      height: 100vh;                        /* fallback for very old browsers */
      height: 100lvh;                       /* native lvh for modern browsers */
      height: calc(100 * var(--lvh, 1lvh)); /* polyfilled stable version */
  }
  ```

**Which Unit Should I Use?**
- **`--fvh`** (Fixed Viewport Height = `vh`): General purpose stable viewport height, good for most use cases
- **`--lvh`** (Large Viewport Height): Use when you want content to fit the **full available space** when browser UI is hidden (typically after scrolling down)
- **`--svh`** (Small Viewport Height): Use when you want content to **always be visible** even when browser UI is shown (initial page load, scrolling up)

<br>

#### 3. Framework Integration Examples
**React:**
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

**Next.js**
```javascript
import { useEffect } from 'react';
import { FixedVhPolyfill } from 'fixed-vh-polyfill';

function App() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      FixedVhPolyfill.init();
    }
    return () => FixedVhPolyfill.cleanup();
  }, []);
  return <div className="fullscreen">{/* ... */}</div>;
}
```

**Vue 3**
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

<br>

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


<br>

## 🐞 Debug Mode

When `debugMode` is set to `true` in the configuration, a small, draggable element will be added to the bottom-right of the screen. This element displays the real-time internal state of the polyfill, which is useful for visually confirming how the polyfill is operating on a target device.

Enable overlay debug UI:
```javascript
FixedVhPolyfill.init({ debugMode: true });
```

<br>

## 📈 Performance Impact
- **Lazy Detection**: Only 5 measurements needed
- **Debounced Updates**: 200ms debouncing prevents excessive updates  
- **Auto-Cleanup**: Removes listeners when not needed
- **Memory Efficient**: Uses requestAnimationFrame for smooth updates

<br>

## 👨‍💻 Author
- **GitHub**: [@restarea92](https://github.com/restarea92)
- **Email**: [restarea@me.com](mailto:restarea@me.com)

<br>

## 🤝 License

This project is licensed under the **MIT License**.
