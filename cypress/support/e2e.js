import '@cypress/code-coverage/support';
import './commands';
import 'cypress-file-upload';

before(() => {
  cy.viewport(2000,2000)
  cy.visit('http://localhost:6101/');
})
