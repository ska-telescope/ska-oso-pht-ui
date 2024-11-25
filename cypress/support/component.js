import '@cypress/code-coverage/support';
import './commands';
import 'cypress-file-upload';

import { mount } from 'cypress/react18';

Cypress.Commands.add('mount', mount);

Cypress.Commands.add('readJsonFile', filePath => {
  return cy.fixture(filePath);
});

Cypress.on('uncaught:exception', () => false);
