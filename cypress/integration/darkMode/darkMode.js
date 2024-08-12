import {When, Then } from 'cypress-cucumber-preprocessor/steps';

When('User clicks on the dark mode button', () => {
  cy.get('[data-testid="Brightness7Icon"]').click();
  cy.get('[data-testid="Brightness4Icon"]').should('be.visible');
});
Then('Dark mode is available', () => {
  cy.get('[data-testid="Brightness4Icon"]').should('be.visible');
});
