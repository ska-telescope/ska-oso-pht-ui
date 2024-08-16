import { defineConfig } from 'cypress';
import { addCucumberPreprocessorPlugin } from "@badeball/cypress-cucumber-preprocessor";
import createEsbuildPlugin from "@badeball/cypress-cucumber-preprocessor/esbuild";
import createBundler from "@bahmutov/cypress-esbuild-preprocessor";
import { configureXrayPlugin, syncFeatureFile } from "cypress-xray-plugin";
import fix from "cypress-on-fix";

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
    async setupNodeEvents(on, config) {
      const fixedOn = fix(on);
      await addCucumberPreprocessorPlugin(fixedOn, config);
      await configureXrayPlugin(
        fixedOn,
        config,
        {
          jira: {
            projectKey: "XTP",         // placeholder value
            url: "https://jira.skatelescope.org" // placeholder value
          },
          xray: {
            status: {
              step: {
                skipped: "SKIPPED"
              }
            },
            uploadResults: true
          },
          cucumber: {
            featureFileExtension: ".feature",
            stepDefinition: ""
          }
        }
      );
      fixedOn("file:preprocessor", async (file) => {
        syncFeatureFile(file);
        const cucumberPlugin = createBundler({
          plugins: [createEsbuildPlugin(config)],
        });
        return cucumberPlugin(file);
      });
      return config;
    },
    specPattern: 'cypress/integration/**/*.feature'
  }
});
