// Logs in through Indigo's real login page with the app's own client, which the main suite
// doesn't do (see support/auth.js). This checks the parts of login that only exist in a real
// deployment: the app's Indigo client registration, the redirect URI the deployment sends, and
// the redirect back into the app.
//
// Run it against a deployment whose redirect URI is registered for the app's Indigo client:
//   E2E_SUITE=smoke yarn cypress run --config baseUrl=<deployment URL>
import { INDIGO_IAM_ORIGIN, withTestUserCredentials } from '../support/auth';

describe('Indigo login', () => {
  it('logs in through Indigo and calls the backend with the token', () => {
    // Indigo only checks the redirect URI after the user signs in. If it rejects it, the browser
    // stays on Indigo's "OAuth Error" page (see the failure screenshot) and the wait for the app
    // below fails with "the application is at origin https://iam-...".
    cy.on('fail', (error) => {
      if (error.message.includes(`application is at origin \`${INDIGO_IAM_ORIGIN}\``)) {
        error.message =
          'Login did not return to the app - Indigo most likely rejected the redirect URI ' +
          `(check it is registered for the app's client). Original error: ${error.message}`;
      }
      throw error;
    });

    cy.intercept('GET', '**/oso/api/**').as('backendCall');

    cy.visit('/?use_indigo=true');
    cy.get('[data-testid="loginButton"]', { timeout: 15000 }).first().click();

    withTestUserCredentials((credentials) => {
      cy.origin(INDIGO_IAM_ORIGIN, { args: credentials }, ({ username, password }) => {
        cy.get('#username', { timeout: 20000 }).type(username);
        cy.get('#password').type(password, { log: false });
        cy.get('#login-submit').click();
      });
    });

    // Back in the app, logged in as the test user
    cy.get('[data-testid="usernameMenu"]', { timeout: 30000 }).should('exist');

    // The token MSAL got from Indigo is accepted by ska-oso-services
    cy.wait('@backendCall', { timeout: 30000 }).then(({ request, response }) => {
      expect(request.headers.authorization).to.match(/^Bearer /);
      expect(response.statusCode).to.be.lessThan(400);
    });
  });
});
