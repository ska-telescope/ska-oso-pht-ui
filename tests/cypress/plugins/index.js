/* eslint-disable global-require */
const cucumber = require('cypress-cucumber-preprocessor').default;

module.exports = (on, config) => {
  on('task', require('@cypress/code-coverage/task'));
  on('file:preprocessor', cucumber());
};
