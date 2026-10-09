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
    specPattern: ['tests/cypress/e2e/**/*.test.{js,jsx,ts,tsx}'],
    setupNodeEvents(on, config) {
      on('file:preprocessor', vitePreprocessor());

      // Lets scripts/cypressParallel.mjs hand each worker a slice of the spec list via the
      // SPLIT/SPLIT_INDEX env vars instead of the orchestrator computing `--spec` itself. Only
      // takes effect when those env vars are set, so `cypress open`/a plain `cypress run` are
      // unaffected.
      cypressSplit(on, config);

      return config;
    }
  },

  retries: {
    runMode: 2,
    openMode: 0
  }
});
