// The rest of the suite logs in via hydrateIndigoSession (see common/cypressTestAuth.js) for
// speed - it seeds a real token straight into MSAL's cache via MSAL's own loadExternalTokens()
// API, skipping the browser redirect round trip. That means MSAL's actual
// instance.loginRedirect() -> Indigo -> PKCE-redirect-back -> handleRedirectPromise() code path
// is never otherwise exercised anywhere in the suite. This spec is that one exception: it drives
// the real thing, so a regression in that handshake (e.g. a MSAL upgrade changing how the
// redirect response is processed) still gets caught somewhere.
import { loginAsIndigoUserViaRealBrowserFlow } from '../common/cypressTestAuth';
import { clearLocalStorage } from '../common/common';

describe('Real MSAL login (loginRedirect -> Indigo -> redirect back)', () => {
  afterEach(() => {
    clearLocalStorage();
  });

  it('logs in via the real Indigo IAM redirect flow and reaches an authenticated session', () => {
    loginAsIndigoUserViaRealBrowserFlow();
    cy.visit('/');
    cy.get('[data-testid="usernameMenu"]').should('exist').and('be.visible');
  });
});
