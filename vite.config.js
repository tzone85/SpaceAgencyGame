import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
  },
  server: {
    port: 3004,
    strictPort: false, // Auto-increment if port is taken
    open: true,
  },
});
