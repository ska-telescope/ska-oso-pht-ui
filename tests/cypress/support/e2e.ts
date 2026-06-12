/// <reference types="cypress" />
import 'cypress-real-events';
import 'cypress-file-upload';

Cypress.on('uncaught:exception', () => false);
