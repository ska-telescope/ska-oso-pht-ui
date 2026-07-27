/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import viteTsconfigPaths from 'vite-tsconfig-paths';

const proxyTarget = process.env.BACKEND_PROXY;
// Lets /oso/ be redirected to a local dev instance of ska-oso-services (e.g. for testing an
// unreleased change) without also hijacking /senscalc/, which has no local equivalent and must
// keep hitting the real deployment. Falls back to BACKEND_PROXY when unset.
const osoProxyTarget = process.env.OSO_SERVICES_PROXY || proxyTarget;

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
            target: osoProxyTarget,
            changeOrigin: true,
            secure: false
          },
          '/senscalc/': {
            target: proxyTarget,
            changeOrigin: true,
            secure: false,
            rewrite: (path) => path.replace(/^\/senscalc/, '')
          }
        }
      : undefined
  },
});
