import { Given } from 'cypress-cucumber-preprocessor/steps';

Given('I navigate to the website', () => {
  cy.visit('http://localhost:6101/');
});
