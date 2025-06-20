import { defineConfig } from 'cypress';
import vitePreprocessor from 'cypress-vite';

export default defineConfig({
  video: false,
  projectId: 'ssiwb9',
  fixturesFolder: 'cypress/fixtures',
  screenshotsFolder: 'cypress/artefacts/screenshots',
  videosFolder: 'cypress/artefacts/videos',
  downloadsFolder: 'cypress/artefacts/downloads',
  e2e: {
    baseUrl: 'http://localhost:6101',
    experimentalRunAllSpecs: true,
    experimentalMemoryManagement: true,
    supportFile: 'cypress/support/e2e.ts',
    specPattern: ['cypress/e2e/**/*.test.{js,jsx,ts,tsx}'],
    setupNodeEvents(on) {
      on('file:preprocessor', vitePreprocessor());
    }
  },

  retries: {
    runMode: 2,
    openMode: 0
  }
});
