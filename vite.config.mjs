/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import viteTsconfigPaths from 'vite-tsconfig-paths';

const proxyTarget = process.env.BACKEND_PROXY;
const s3MockProxy = process.env.S3MOCK_PROXY || 'http://localhost:9090';

export default defineConfig({
  base: './',
  build: { rollupOptions: { external: ['/env.js'] } },
  plugins: [react(), viteTsconfigPaths()],
  server: {
    historyApiFallback: true,
    host: true,
    port: 6101,
    proxy: proxyTarget
      ? {
          '/oso/': {
            target: proxyTarget,
            changeOrigin: true,
            secure: false
          },
          '/senscalc/': {
            target: proxyTarget,
            changeOrigin: true,
            secure: false,
            rewrite: (path) => path.replace(/^\/senscalc/, '')
          },
          '/s3mock/': {
            target: s3MockProxy,
            changeOrigin: true,
            secure: false,
            rewrite: path => path.replace(/^\/s3mock/, '')
          }
        }
      : undefined
  },
});
