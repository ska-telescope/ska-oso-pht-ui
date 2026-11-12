/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const proxyTarget = process.env.BACKEND_PROXY;
// Lets /oso/ be redirected to a local dev instance of ska-oso-services (e.g. for testing an
// unreleased change) without also hijacking /senscalc/, which has no local equivalent and must
// keep hitting the real deployment. Falls back to BACKEND_PROXY when unset.
const osoProxyTarget = process.env.OSO_SERVICES_PROXY || proxyTarget;

export default defineConfig(({ mode }) => ({
  base: './',
  build: {
    rollupOptions: {
      external: ['/env.js'],
      // auth-callback.html receives MSAL's silent and popup sign-in responses (src/authCallback.ts).
      // Not when cypress-vite bundles a spec (mode 'cypress', see cypress.config.mjs), as it
      // builds each spec as its only input.
      ...(mode === 'cypress'
        ? {}
        : { input: { main: 'index.html', authCallback: 'auth-callback.html' } })
    }
  },
  plugins: [react()],
  resolve: { tsconfigPaths: true },
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
  }
}));
