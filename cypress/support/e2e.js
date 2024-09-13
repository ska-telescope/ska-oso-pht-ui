import '@cypress/code-coverage/support';
import './commands';
import 'cypress-file-upload';

before(() => {
  cy.viewport(1500, 1000);
  cy.visit('http://localhost:6101/');
});
