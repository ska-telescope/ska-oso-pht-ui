/// <reference types="cypress" />
import 'cypress-real-events';
import 'cypress-file-upload';
import '@testing-library/cypress/add-commands';

Cypress.on('uncaught:exception', (err) => !err.message.includes('ResizeObserver loop'));
