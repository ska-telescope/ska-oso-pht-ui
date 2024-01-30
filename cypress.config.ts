const { defineConfig } = require("cypress");
require('dotenv').config()

module.exports = defineConfig({
  video: false,
  env: {
    REACT_APP_USE_LOCAL_DATA: "true",
  },
  component: {
    devServer: {
      framework: "react",
      bundler: "webpack",
    },
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config)
    },
  },

  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
      require('./cypress/plugins/index.js')(on, config)
      on('file:preprocessor', require('@cypress/code-coverage/use-babelrc'))
      return config
    },
  },
});
