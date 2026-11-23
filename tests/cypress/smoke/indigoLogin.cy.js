// Logs in through Indigo's real login page with the app's own client, which the main suite
// doesn't do (see support/auth.js). This checks the parts of login that only exist in a real
// deployment: the app's Indigo client registration, the redirect URIs the deployment sends, and
// the redirect back into the app.
//
// Run it against a deployment whose redirect URIs are registered for the app's Indigo client
// (the app URL, and <app URL>auth-callback.html):
//   E2E_SUITE=smoke yarn cypress run --config baseUrl=<deployment URL>
import { INDIGO_IAM_ORIGIN, withTestUserCredentials } from '../support/auth';

// Logs in through Indigo's login page and waits until the app shows the user as logged in.
// Indigo only checks the redirect URI after the user signs in. If it rejects it, the browser
// stays on Indigo's "OAuth Error" page (see the failure screenshot) and the wait for the app
// fails with "the application is at origin https://iam-...".
const loginThroughIndigo = () => {
  cy.on('fail', (error) => {
    if (error.message.includes(`application is at origin \`${INDIGO_IAM_ORIGIN}\``)) {
      error.message =
        'Login did not return to the app - Indigo most likely rejected the redirect URI ' +
        `(check it is registered for the app's client). Original error: ${error.message}`;
    }
    throw error;
  });

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
};

describe('Indigo login', () => {
  it('logs in through Indigo and calls the backend with the token', () => {
    cy.intercept('GET', '**/oso/api/**').as('backendCall');

    loginThroughIndigo();

    // The token MSAL got from Indigo is accepted by ska-oso-services
    cy.wait('@backendCall', { timeout: 30000 }).then(({ request, response }) => {
      expect(request.headers.authorization).to.match(/^Bearer /);
      expect(response.statusCode).to.be.lessThan(400);
    });
  });

  // Silent token requests (a forced refresh, or renewing an expired token) send Indigo's response
  // to auth-callback.html, not to the app (see getAuthCallbackUri in src/utils/authConfig.ts). If
  // it isn't registered they fail without any message, so this asks Indigo directly. It sends the
  // request the app's hidden iframe would, with the user's Indigo session from logging in:
  // Indigo redirects to auth-callback.html (with a code, or an error such as consent_required)
  // only once it has accepted the redirect URI, and shows its "OAuth Error" page otherwise.
  // The code isn't used.
  it('accepts the deployment’s auth-callback.html as a redirect URI', () => {
    loginThroughIndigo();

    cy.window().then((win) => {
      const appUrl = new URL(win.env.MSENTRA_REDIRECT_URI, win.location.origin);
      if (!appUrl.pathname.endsWith('/')) {
        appUrl.pathname += '/';
      }
      const callbackUri = new URL('auth-callback.html', appUrl).href;
      const authorizeUrl = new URL('authorize', win.env.INDIGO_AUTHORITY);
      authorizeUrl.search = new URLSearchParams({
        client_id: win.env.INDIGO_CLIENT_ID,
        response_type: 'code',
        redirect_uri: callbackUri,
        scope: win.env.INDIGO_SCOPE,
        prompt: 'none',
        state: 'cypress-smoke',
        nonce: 'cypress-smoke'
      }).toString();

      // Sent with the browser's Indigo session cookies
      cy.request({ url: authorizeUrl.href, followRedirect: false, failOnStatusCode: false }).then(
        ({ status, redirectedToUrl, headers }) => {
          const location = redirectedToUrl ?? headers.location ?? '';
          expect(
            location,
            `Indigo should redirect to ${callbackUri}, and answered ${status} ` +
              `${location ? `redirecting to ${location}` : 'with no redirect'}. If it didn't, ` +
              `register it as a redirect URI for client ${win.env.INDIGO_CLIENT_ID}`
          ).to.match(new RegExp(`^${Cypress._.escapeRegExp(callbackUri)}[?#]`));
          const answer = new URL(location.replace('#', '?')).searchParams;
          cy.log(`Indigo sent auth-callback.html ${answer.get('error') ?? 'a code'}`);
        }
      );
    });
  });
});
