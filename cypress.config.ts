/* eslint-disable global-require */
/* eslint-disable import/no-import-module-exports */
import { defineConfig } from 'cypress';

export default defineConfig({
  projectId: 'ssiwb9',
  fixturesFolder: 'cypress/fixtures',
  screenshotsFolder: 'cypress/screenshots',
  downloadsFolder: 'cypress/downloads',
  component: {
    supportFile: 'cypress/support/component.js',
    specPattern: '**/*.test.{js,jsx,ts,tsx}',
    indexHtmlFile: 'cypress/support/component-index.html',
    devServer: {
      framework: 'react',
      bundler: 'webpack'
    },
    setupNodeEvents(on, config) {
      require('@cypress/code-coverage/task')(on, config);
      return config;
    },
    excludeSpecPattern: 'cypress/integration/**'
  },
  e2e: {
    baseUrl: 'http://localhost:6101',
    defaultCommandTimeout: 10000,
    deleteVideoOnPassed: true,
    betterRetries: true,
    reporter: 'cypress-xray-junit-reporter',
    reporterOptions: {
      mochaFile: './report/[suiteName].xml',
      useFullSuiteTitle: false,
      jenkinsMode: true,
      xrayMode: true, // if JiraKey are set correctly inside the test the XML report will contain the JiraKey value
      attachScreenshot: true // if a test fails, the screenshot will be attached to the XML report and imported into xray
    },
    setupNodeEvents(on, config) {
      require('cypress-xray-junit-reporter/plugin')(on, config, {}); // also needed
      return config;
    },
    specPattern: 'cypress/integration/**/*.test.js'
  }
});
