// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

import './commands';
import 'cypress-plugin-tab';

// ✅ Inject mock MSAL instance for Cypress
if (window.Cypress) {
  window.msalInstance = {
    loginRedirect: () => Promise.resolve({ account: { username: 'testuser@domain.com' } }),
    acquireTokenSilent: () => Promise.resolve({ accessToken: 'fake-access-token' }),
    getAllAccounts: () => [{ username: 'testuser@domain.com' }]
  };
}