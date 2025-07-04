import 'cypress-xray-junit-reporter/support';
import './commands';
import 'cypress-file-upload';

beforeEach(() => {
  cy.viewport(2000, 1100);
  cy.visit('/');
});
