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
    execTimeout: 120000, // 60000
    taskTimeout: 120000, // 60000
    pageLoadTimeout:  120000, // 60000
    requestTimeout:  10000, // 5000
    responseTimeout:  60000, // 30000
    //
    experimentalRunAllSpecs: true,
    experimentalMemoryManagement: true,
    supportFile: 'tests/cypress/support/e2e.ts',
    specPattern: ['tests/cypress/e2e/**/*.test.{js,jsx,ts,tsx}'],
    setupNodeEvents(on, config) {
      on('file:preprocessor', vitePreprocessor());

      // Default reporter for a plain `cypress run`/`cypress open` - only applied if the caller
      // hasn't already asked for a specific reporter (e.g. scripts/cypressParallel.mjs passes its
      // own `--reporter junit --reporter-options mochaFile=...` per worker, to give each worker's
      // specs their own file; config.reporter/reporterOptions are already populated from those CLI
      // flags by the time setupNodeEvents runs, so unconditionally overwriting them here would
      // silently send every worker's every spec to this same single hardcoded path instead).
      if (!config.reporter) {
        config.reporter = 'mocha-junit-reporter';
        config.reporterOptions = {
          mochaFile: 'cypress/results/e2e-coverage.xml',
          toConsole: true
        };
      }

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
