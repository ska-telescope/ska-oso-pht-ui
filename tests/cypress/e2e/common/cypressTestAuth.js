// Real MSAL sessions for Cypress specs, so tests exercise the app's actual auth code paths
// instead of a fake bypass.
//
// Two ways in: loginAsIndigoUser/loginAsOpsUser (used by almost every spec, via common.js's
// initialize()) seed MSAL's cache instantly from a real token - fast, and indistinguishable from
// a real login to the rest of the app. loginAsIndigoUserViaRealBrowserFlow drives the actual
// loginRedirect() -> Indigo -> redirect-back handshake for real, used by exactly one spec so that
// code path still gets exercised somewhere too.
//
// See hydrateIndigoSession's and establishIndigoSession's own comments below for how/why each
// actually works (both bypass Indigo's login/consent HTML forms via direct API calls rather than
// cy.origin() - cy.origin() turned out to be unreliable for this, see their comments for why).
// fetchLiveIndigoToken/fetchLiveOpsToken are separate - kept only for assignProposalToPanel's own
// API fixture setup. Also see tests/cypress/e2e/auth/realMsalLogin.test.js and
// axiosAuthClient.ts's __msalLoadExternalTokens hook.
//
// The suite always runs against a live backend now - there is no stubbed/mocked mode any more.

const INDIGO_IAM_ORIGIN = 'https://iam-1.staging.devx.skao.int';
const INDIGO_IAM_TOKEN_URL = `${INDIGO_IAM_ORIGIN}/token`;

// Non-secret test credentials for an isolated staging environment - the same defaults
// ska-oso-services itself commits to its public repo (tests/live/conftest.py there), NOT
// ska-aaa-authhelpers' generic ones - that client is only authorized for 'openid profile', which
// ska-oso-services' write endpoints reject. This one is a confidential client specifically
// granted pht:read/pht:readwrite for password-grant (ROPC) use. Override via CYPRESS_INDIGO_TEST_*
// env vars (or cypress.env.json) to point at a different IAM user/client.
const DEFAULT_CLIENT_ID = '436915fe-7d98-487a-93b2-b3d5f9bc5952';
const DEFAULT_CLIENT_SECRET =
  'AOzHcqR2tz5sfZSOPmuQ4CU6VDQmUSSJCHZLEpMUHhRADvhh4og_XD8SNDGVI4uYA4QN_QVS4nS9AB_tT9IQd-0';
const DEFAULT_USERNAME = 'astronomer1';
const DEFAULT_PASSWORD = 'test';
// Matches this app's own INDIGO_AUDIENCE/INDIGO_SCOPE (see authConfig.ts / Makefile's dev-start).
const DEFAULT_AUDIENCE = 'test:pht';
const DEFAULT_SCOPE = 'openid profile pht:read pht:readwrite';

// A second live IAM account (Ralph Copeland), granted app:pht:ops_proposal_admin,
// app:pht:ops_reviewer_science and app:pht:ops_reviewer_technical - astronomer1 has none of
// these. See users.js's liveOps flag for which fixtures log in as this account instead.
const DEFAULT_OPS_USERNAME = 'sciops1';
const DEFAULT_OPS_PASSWORD = 'test';

const envOr = (key, fallback) => Cypress.env(key) || fallback;

// Full raw ROPC token response (id_token/access_token/expires_in/scope/...) - this exact shape is
// what MSAL's loadExternalTokens() expects as its "response" argument (see
// ExternalTokenResponse in @azure/msal-common), so hydrateIndigoSession below can pass it through
// with no reshaping.
const fetchLiveIndigoTokenResponse = ({ username, password } = {}) =>
  cy
    .request({
      method: 'POST',
      url: INDIGO_IAM_TOKEN_URL,
      form: true,
      auth: {
        username: envOr('INDIGO_TEST_CLIENT_ID', DEFAULT_CLIENT_ID),
        password: envOr('INDIGO_TEST_CLIENT_SECRET', DEFAULT_CLIENT_SECRET)
      },
      body: {
        grant_type: 'password',
        username: username ?? envOr('INDIGO_TEST_USERNAME', DEFAULT_USERNAME),
        password: password ?? envOr('INDIGO_TEST_PASSWORD', DEFAULT_PASSWORD),
        scope: envOr('INDIGO_TEST_SCOPE', DEFAULT_SCOPE),
        audience: envOr('INDIGO_TEST_AUDIENCE', DEFAULT_AUDIENCE)
      },
      timeout: 15000
    })
    .then((response) => response.body);

export const fetchLiveIndigoToken = (opts) =>
  fetchLiveIndigoTokenResponse(opts).then((body) => body.access_token);

// Token for the ops/reviewer-admin account (see DEFAULT_OPS_USERNAME above) - only used by
// assignProposalToPanel's own direct API calls, see the file header comment.
export const fetchLiveOpsToken = () =>
  fetchLiveIndigoToken({
    username: envOr('INDIGO_OPS_USERNAME', DEFAULT_OPS_USERNAME),
    password: envOr('INDIGO_OPS_PASSWORD', DEFAULT_OPS_PASSWORD)
  });

const fetchLiveOpsTokenResponse = () =>
  fetchLiveIndigoTokenResponse({
    username: envOr('INDIGO_OPS_USERNAME', DEFAULT_OPS_USERNAME),
    password: envOr('INDIGO_OPS_PASSWORD', DEFAULT_OPS_PASSWORD)
  });

// Seeds MSAL's cache from a real token response via the app's __msalLoadExternalTokens hook (see
// axiosAuthClient.ts) - scopes must match what axiosAuthClient.ts's loginRequest asks for, or the
// later acquireTokenSilent() call in the request interceptor won't find a matching cached access
// token. Revisits the app afterwards so AuthProvider mounts fresh and reads the now-populated
// cache from scratch, rather than depending on whichever MSAL event (if any) loadExternalTokens()
// itself fires being one msal-react happens to be listening for.
// ?use_indigo=true (on every cy.visit('/...') below) forces the app into Indigo auth mode via
// authConfig.ts's getUseIndigo(), regardless of how the target deployment's own USE_INDIGO env
// var happens to be set - otherwise AuthProvider can construct MSAL against the Entra/Microsoft
// fallback authority while these helpers hydrate an Indigo-issued token into it, which looks fine
// until the first acquireTokenSilent() call sends a real hidden-iframe request to Microsoft's
// login endpoint instead of Indigo and hangs. getUseIndigo() persists the choice to
// sessionStorage (which cy.session() snapshots), so only the very first visit per session strictly
// needs the param, but every entry point passes it explicitly rather than relying on that.
const hydrateIndigoSession = (tokenResponse) => {
  cy.visit('/?use_indigo=true');
  cy.window({ timeout: 15000 })
    .its('__msalLoadExternalTokens')
    .then((loadExternalTokens) => {
      const request = {
        scopes: envOr('INDIGO_TEST_SCOPE', DEFAULT_SCOPE).split(' ').filter(Boolean)
      };
      return cy.wrap(loadExternalTokens(request, tokenResponse), { timeout: 15000 });
    });
  cy.visit('/?use_indigo=true');
  cy.get('[data-testid="usernameMenu"]', { timeout: 15000 }).should('exist');
};

// cy.session() snapshots the resulting localStorage/sessionStorage (where MSAL's own token cache
// lives) keyed by username and reuses it - including across spec files within the same
// `cypress run`/worker process (cacheAcrossSpecs) - so only the first login of a given account
// per worker pays for the ROPC round trip at all.
const loginWithHydratedMsal = (username, fetchTokenResponse) => {
  cy.session(
    ['hydrated-msal-session', username],
    () => {
      fetchTokenResponse().then((tokenResponse) => hydrateIndigoSession(tokenResponse));
    },
    {
      cacheAcrossSpecs: true,
      validate() {
        cy.visit('/?use_indigo=true');
        cy.get('[data-testid="usernameMenu"]', { timeout: 15000 }).should('exist');
      }
    }
  );
};

export const loginAsIndigoUser = () =>
  loginWithHydratedMsal(envOr('INDIGO_TEST_USERNAME', DEFAULT_USERNAME), () =>
    fetchLiveIndigoTokenResponse({
      username: envOr('INDIGO_TEST_USERNAME', DEFAULT_USERNAME),
      password: envOr('INDIGO_TEST_PASSWORD', DEFAULT_PASSWORD)
    })
  );

export const loginAsOpsUser = () =>
  loginWithHydratedMsal(
    envOr('INDIGO_OPS_USERNAME', DEFAULT_OPS_USERNAME),
    fetchLiveOpsTokenResponse
  );

// --- Real browser-driven flow - used by exactly one spec (see file header comment) ---

// The app's own public SPA client (matches authConfig.ts/Makefile's INDIGO_CLIENT_ID).
const INDIGO_SPA_CLIENT_ID = envOr('INDIGO_CLIENT_ID', 'd546e462-637c-44ff-b2b9-3345a960ad42');
// Any well-formed PKCE challenge works here - establishIndigoSession below never redeems the
// resulting authorization code itself (see its own comment), so there's no matching code_verifier
// to track.
const THROWAWAY_CODE_CHALLENGE = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';

const buildIndigoAuthorizeUrl = () => {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: INDIGO_SPA_CLIENT_ID,
    redirect_uri: Cypress.config('baseUrl'),
    scope: envOr('INDIGO_TEST_SCOPE', DEFAULT_SCOPE),
    state: 'cypress-preauth',
    code_challenge: THROWAWAY_CODE_CHALLENGE,
    code_challenge_method: 'S256',
    audience: envOr('INDIGO_TEST_AUDIENCE', DEFAULT_AUDIENCE)
  });
  return `${INDIGO_IAM_ORIGIN}/authorize?${params.toString()}`;
};

// Establishes a real Indigo IAM login session, and pre-approves this client's consent if Indigo
// hasn't already remembered a decision for this account+client+scope, via direct HTTP calls
// (cy.request, which shares Cypress's browser-wide cookie jar - the same "log in via API, not the
// UI" pattern Cypress itself recommends for programmatic login) instead of driving Indigo's
// actual login/consent HTML forms through cy.origin(). That turned out to be fundamentally
// unreliable here - see the file header comment for why.
//
// The authorize/PKCE parameters used to reach these pages here are throwaways - the resulting
// authorization code is never redeemed. Once these requests leave Indigo with "already logged in,
// already consented" for this account+client+scope, loginAsIndigoUserViaRealBrowserFlow's real
// instance.loginRedirect() click (with MSAL's own, separately and correctly PKCE-bound challenge)
// finds the same account+client+scope already approved and 302s straight through both steps
// without rendering either page - so MSAL's real handleRedirectPromise()/token-exchange code (the
// part that actually matters for what this is testing) still runs for real; only Indigo's own
// login/consent HTML forms are bypassed, and those are Indigo's infrastructure, not this app's
// code.
const establishIndigoSession = (username, password) => {
  const authorizeUrl = buildIndigoAuthorizeUrl();

  // Follows the redirect chain down to Indigo's login page, picking up its session cookie.
  cy.request({ method: 'GET', url: authorizeUrl });

  // Submits credentials without following the resulting redirect, so the next request can decide
  // what to do based on where it actually points rather than blindly chasing it.
  cy.request({
    method: 'POST',
    url: `${INDIGO_IAM_ORIGIN}/login`,
    form: true,
    body: { username, password, submit: 'Sign in' },
    followRedirect: false
  }).then((loginResponse) => {
    cy.request({ method: 'GET', url: loginResponse.headers.location }).then((authorizeResponse) => {
      const $page = Cypress.$(authorizeResponse.body);
      const approveButton = $page.find('input[name="authorize"]');
      if (approveButton.length === 0) {
        // Already consented previously - Indigo redirected straight through, nothing left to do.
        return;
      }
      // Replicate the consent form's own hidden scope.* fields rather than hardcoding them, so
      // this keeps working if the requested scopes ever change. "until revoked" so a later run
      // doesn't need to repeat this consent step at all, real login included.
      const body = {
        user_oauth_approval: 'true',
        authorize: 'Authorize',
        remember: 'until-revoked'
      };
      $page.find('input[type="hidden"][name^="scope."]').each((_, el) => {
        body[el.getAttribute('name')] = el.getAttribute('value');
      });
      cy.request({ method: 'POST', url: `${INDIGO_IAM_ORIGIN}/authorize`, form: true, body });
    });
  });
};

export const loginAsIndigoUserViaRealBrowserFlow = () => {
  const username = envOr('INDIGO_TEST_USERNAME', DEFAULT_USERNAME);
  const password = envOr('INDIGO_TEST_PASSWORD', DEFAULT_PASSWORD);
  cy.session(
    ['real-browser-msal-session', username],
    () => {
      establishIndigoSession(username, password);

      cy.visit('/?use_indigo=true');
      cy.get('[data-testid="loginButton"]').click();

      // Redirect lands back on the app's own origin with ?code=...&state=... - MSAL's
      // handleRedirectPromise() (run on AuthProvider mount) exchanges it for tokens and populates
      // accounts, at which point UserMenu swaps the login button for the username menu.
      cy.get('[data-testid="usernameMenu"]', { timeout: 20000 }).should('exist');
    },
    {
      validate() {
        cy.visit('/?use_indigo=true');
        cy.get('[data-testid="usernameMenu"]', { timeout: 15000 }).should('exist');
      }
    }
  );
};
