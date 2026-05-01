import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  base: process.env.GITHUB_PAGES ? '/SpaceAgencyGame/' : '/',
  build: {
    outDir: 'dist',
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    strictPort: false, // Auto-increment if port is taken
    open: true,
  },
});
