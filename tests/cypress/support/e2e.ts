/// <reference types="cypress" />
import 'cypress-real-events';
import 'cypress-file-upload';

Cypress.on('uncaught:exception', err => !err.message.includes('ResizeObserver loop'));
