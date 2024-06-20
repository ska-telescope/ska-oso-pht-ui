import { Given, Then, When } from 'cypress-cucumber-preprocessor/steps';

Given("I navigate to the website", () => {
  cy.visit('http://localhost:6101/');
})
When("User clicks on the dark mode button", () => {
  cy.get('[data-testid="Brightness7Icon"]').click();
  cy.get('[data-testid="Brightness4Icon"]').should('be.visible');
})
Then("Dark mode is available", () => {
  cy.get('[data-testid="Brightness4Icon"]').should('be.visible');
})