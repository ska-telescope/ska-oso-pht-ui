/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import viteTsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  base: './',
  build: { rollupOptions: { external: ['/env.js'] } },
  plugins: [react(), viteTsconfigPaths()],
  server: {
    host: true,
    port: 6101
  },
});
