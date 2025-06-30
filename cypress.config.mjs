import { defineConfig } from 'cypress';
import vitePreprocessor from 'cypress-vite';
import { configureXrayPlugin } from "cypress-xray-plugin";


export default defineConfig({
  video: false,
  projectId: 'ssiwb9', //projectId to enable cypress cloud
  fixturesFolder: 'cypress/fixtures',
  screenshotsFolder: 'cypress/artefacts/screenshots',
  videosFolder: 'cypress/artefacts/videos',
  downloadsFolder: 'cypress/artefacts/downloads',
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
    supportFile: 'cypress/support/e2e.ts',
    specPattern: ['cypress/e2e/**/*.test.{js,jsx,ts,tsx}'],

    async setupNodeEvents(on, config) {
      await configureXrayPlugin(
        on,
        config,
        {
          xray: {
            serverUrl: "https://jira.skatelescope.org",
            testPlan: "XTP-59737",
            testExecution: "XTP-59739", // Optional, leave blank to create new execution
            token: "cTxVgWTc72V2yKerMXQddlf4EuMI33VTdoTdfY",
            uploadResults: true
          },
          jira: {
            projectKey: "XTP",
            url: "https://jira.skatelescope.org" // placeholder value
          },
          cucumber: {
            prefixes: {
              test: "TestName:"
            }
          },
        }
      );
      on('file:preprocessor', vitePreprocessor());
    }
  },

  retries: {
    runMode: 2,
    openMode: 0
  }
});
