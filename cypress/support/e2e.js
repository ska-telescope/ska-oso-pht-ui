import 'cypress-xray-junit-reporter/support';
import '@cypress/code-coverage/support';
import './commands';
import 'cypress-file-upload';

beforeEach(() => {
  cy.viewport(2000, 2000);
  cy.visit('/');
});
