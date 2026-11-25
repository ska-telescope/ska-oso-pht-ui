import { defineConfig } from 'cypress';
import vitePreprocessor from 'cypress-vite';
import cypressSplit from 'cypress-split';

// Headless Chrome/Electron tries to persist GTK theme settings via dconf over D-Bus, which
// doesn't exist in most CI containers. Forcing an in-memory GSettings backend stops it
// from trying.
process.env.GSETTINGS_BACKEND = 'memory';

export default defineConfig({
  video: false,
  projectId: 'ssiwb9', //projectId to enable cypress cloud
  fixturesFolder: 'tests/cypress/fixtures',
  screenshotsFolder: 'tests/cypress/artefacts/screenshots',
  videosFolder: 'tests/cypress/artefacts/videos',
  downloadsFolder: 'tests/cypress/artefacts/downloads',
  // Wide enough for the app's desktop layout: full page headings (lg breakpoint), the page
  // status indicators on one row (1500px), and room for fields above the fixed page footer
  viewportWidth: 2000,
  viewportHeight: 1500,
  e2e: {
    baseUrl: 'http://localhost:6101',
    //
    defaultCommandTimeout: 10000,  // 4000
    taskTimeout: 120000, // 60000
    pageLoadTimeout:  120000, // 60000
    requestTimeout:  10000, // 5000
    responseTimeout:  60000, // 30000
    //
    experimentalRunAllSpecs: true,
    supportFile: 'tests/cypress/support/e2e.ts',
    // E2E_SUITE=smoke runs only the real Indigo login specs (see tests/cypress/smoke), which need
    // a deployment whose redirect URI is registered with Indigo
    specPattern:
      process.env.E2E_SUITE === 'smoke'
        ? ['tests/cypress/smoke/**/*.cy.{js,jsx,ts,tsx}']
        : ['tests/cypress/e2e/**/*.cy.{js,jsx,ts,tsx}'],
    setupNodeEvents(on, config) {
      // Mode 'cypress' leaves the app's extra auth-callback.html page out of the build config
      // (see vite.config.mjs), as each spec has to be bundled as the only input
      on('file:preprocessor', vitePreprocessor({ mode: 'cypress' }));

      // Runs only this worker's share of the specs: SPLIT/SPLIT_INDEX locally (set by
      // scripts/cypressParallel.mjs), or GitLab's CI_NODE_TOTAL/CI_NODE_INDEX in parallel CI
      // jobs. With neither set, every spec runs.
      cypressSplit(on, config);

      // Lets each worker log in as a different test user (see tests/cypress/support/auth.js)
      config.env.WORKER_INDEX =
        process.env.SPLIT_INDEX ?? String(Number(process.env.CI_NODE_INDEX ?? 1) - 1);

      return config;
    }
  },

  retries: {
    runMode: 2,
    openMode: 0
  }
});
