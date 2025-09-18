const { defineConfig } = require('cypress');
const createBundler = require('@bahmutov/cypress-esbuild-preprocessor');
const { addCucumberPreprocessorPlugin } = require('@badeball/cypress-cucumber-preprocessor');
const createEsbuildPlugin = require('@badeball/cypress-cucumber-preprocessor/esbuild');

module.exports = defineConfig({
  e2e: {
    async setupNodeEvents(on, config) {
      config.env = config.env || {}; // Ensure env is initialized
      console.log('ENV:', config.env);

      await addCucumberPreprocessorPlugin(config);

      on('file:preprocessor', createBundler({
        plugins: [createEsbuildPlugin(config)],
      }));

      return config;
    },
    baseUrl: 'http://localhost:6100',
    video: false,
    fixturesFolder: 'tests/cypress/fixtures',
    screenshotsFolder: 'tests/cypress/artefacts/screenshots',
    videosFolder: 'tests/cypress/artefacts/videos',
    downloadsFolder: 'tests/cypress/artefacts/downloads',
    defaultCommandTimeout: 10000,
    execTimeout: 120000,
    taskTimeout: 120000,
    pageLoadTimeout: 120000,
    requestTimeout: 10000,
    responseTimeout: 60000,
    experimentalRunAllSpecs: true,
    experimentalMemoryManagement: true,
    supportFile: 'tests/cypress/support/e2e.ts',
    specPattern: ['tests/cypress/e2e/**/*.test.{js,jsx,ts,tsx}'],
  },
});