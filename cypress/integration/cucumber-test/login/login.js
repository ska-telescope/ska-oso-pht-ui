import { Given, When, And } from 'cypress-cucumber-preprocessor/steps';

Given('User is at the login page', () => {
  cy.visit('https://opensource-demo.orangehrmlive.com/');
});

When('User enters username as {string} and password as {string}', (username, password) => {
  cy.get('[placeholder="Username"]').type(username);
  cy.get('[placeholder="Password"]').type(password);
});

And('User clicks on login button', () => {
  cy.get('[type="submit"]').click();
});

