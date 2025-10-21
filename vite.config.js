import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  server: {
    port: 5173,
    open: true,
    strictPort: true,
    watch: {
      usePolling: true
    }
  },
  preview: {
    port: 5173
  }
});
