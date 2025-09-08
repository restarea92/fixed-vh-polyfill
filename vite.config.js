// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  root: 'demo',
  server: {
    open: true, // 자동 브라우저 실행
    watch: {
      usePolling: true
    }
  }
});