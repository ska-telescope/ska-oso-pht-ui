/* eslint-disable global-require */
/* eslint-disable import/no-import-module-exports */
import { defineConfig } from 'cypress';
import { GenerateCtrfReport } from 'cypress-ctrf-json-reporter';
const cucumber = require('cypress-cucumber-preprocessor').default;

export default defineConfig({
  fixturesFolder: 'tests/cypress/fixtures',
  screenshotsFolder: 'tests/cypress/screenshots',
  videosFolder: 'tests/cypress/videos',
  downloadsFolder: 'tests/cypress/downloads',

  component: {
    supportFile: 'tests/cypress/support/component.js',
    indexHtmlFile: 'tests/cypress/support/component-index.html',
    devServer: {
      framework: 'react',
      bundler: 'webpack'
    },
    setupNodeEvents(on, config) {
      require('@cypress/code-coverage/task')(on, config);
      on('file:preprocessor', require('@cypress/code-coverage/use-babelrc'));
      return config;
    },
    excludeSpecPattern: 'tests/cypress/e2e/**'
  },
  e2e: {
    defaultCommandTimeout: 10000,
    setupNodeEvents(on, config) {
      on('file:preprocessor', cucumber());
      new GenerateCtrfReport({
        on
      });
    },
    specPattern: 'cypress/integration/**/*.feature'
  }
});
