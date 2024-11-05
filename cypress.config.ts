/* eslint-disable global-require */
/* eslint-disable import/no-import-module-exports */
import { defineConfig } from 'cypress';
import { GenerateCtrfReport } from 'cypress-ctrf-json-reporter';
import { configureXrayPlugin } from 'cypress-xray-plugin';
const cucumber = require('cypress-cucumber-preprocessor').default;

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
      on('file:preprocessor', require('@cypress/code-coverage/use-babelrc'));
      return config;
    },
    excludeSpecPattern: 'cypress/integration/**'
  },
  e2e: {
    baseUrl: 'http://localhost:6101',
    defaultCommandTimeout: 10000,
    async setupNodeEvents(on, config) {
      await configureXrayPlugin(on, config, {
        jira: {
          projectKey: 'XTP', // placeholder value
          url: 'https://jira.skatelescope.org' // placeholder value
        },
        xray: {
          serverUrl: "https://jira.skatelescope.org",
          testPlan: "XTP-59737",
          testExecution: "XTP-59739", // Optional, leave blank to create new execution
          token: "cTxVgWTc72V2yKerMXQddlf4EuMI33VTdoTdfY",
          uploadResults: true
        }
      });
      on('file:preprocessor', cucumber());
      new GenerateCtrfReport({
        on
      });
      return config;
    },
    specPattern: 'cypress/integration/**/*.feature'
  }
});
