// Real MSAL sessions for Cypress specs, with no test-only code in the app.
//
// loginAsUser (used by almost every spec, via common.js's visitWithAuth()) clicks the app's own
// login button, so MSAL runs its real loginRedirect() and redirect handling. Cypress answers the
// two Indigo endpoints MSAL calls in the browser (see interceptIndigo below):
// - /authorize redirects straight back to the app with a code, so Indigo's login and consent
//   pages are never shown (they can't be driven reliably with cy.origin())
// - /token is sent on to the real Indigo as a password grant for the test user, so the app gets a
//   genuine access token that ska-oso-services validates as normal
// What this does not cover is the browser login with Indigo itself: the app's client
// registration, its redirect URI and Indigo's pages. The specs under tests/cypress/smoke do that
// against a deployment whose redirect URI is registered with Indigo.
// fetchLiveIndigoToken/fetchLiveOpsToken are separate - kept only for assignProposalToPanel's own
// API fixture setup.
//
// The suite always runs against a live backend now - there is no stubbed/mocked mode any more.

const INDIGO_IAM_ORIGIN = 'https://iam-1.staging.devx.skao.int';
export { INDIGO_IAM_ORIGIN };
const INDIGO_IAM_AUTHORIZE_URL = `${INDIGO_IAM_ORIGIN}/authorize`;
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
// Each parallel worker logs in as its own test user
const WORKER_USERNAMES = [DEFAULT_USERNAME, 'astronomer2', 'astronomer3'];
// Matches this app's own INDIGO_AUDIENCE/INDIGO_SCOPE (see authConfig.ts / Makefile's dev-start).
const DEFAULT_AUDIENCE = 'test:pht';
const DEFAULT_SCOPE = 'openid profile pht:read pht:readwrite';

// A second live IAM account (Ralph Copeland), granted app:pht:ops_proposal_admin,
// app:pht:ops_reviewer_science and app:pht:ops_reviewer_technical - astronomer1 has none of
// these. See users.js's `username` field for which fixtures log in as this account instead.
const DEFAULT_OPS_USERNAME = 'sciops1';
const DEFAULT_OPS_PASSWORD = 'test';

const ENV_KEYS = [
  'INDIGO_TEST_CLIENT_ID',
  'INDIGO_TEST_CLIENT_SECRET',
  'INDIGO_TEST_USERNAME',
  'INDIGO_TEST_PASSWORD',
  'INDIGO_TEST_SCOPE',
  'INDIGO_TEST_AUDIENCE',
  'INDIGO_OPS_USERNAME',
  'INDIGO_OPS_PASSWORD',
  // Set per worker by scripts/cypressParallel.mjs
  'WORKER_INDEX'
];

const withEnv = (callback) =>
  cy.env(ENV_KEYS).then((env) => callback((key, fallback) => env[key] || fallback));

// Full raw ROPC token response (id_token/access_token/expires_in/scope/...)
const fetchLiveIndigoTokenResponse = ({ username, password } = {}) =>
  withEnv((envOr) =>
    cy.request({
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
  ).then((response) => response.body);

// Credentials for the default test user, for the smoke specs that log in through Indigo's own pages
export const withTestUserCredentials = (callback) =>
  withEnv((envOr) =>
    callback({
      username: envOr('INDIGO_TEST_USERNAME', DEFAULT_USERNAME),
      password: envOr('INDIGO_TEST_PASSWORD', DEFAULT_PASSWORD)
    })
  );

export const fetchLiveIndigoToken = (opts) =>
  fetchLiveIndigoTokenResponse(opts).then((body) => body.access_token);

// Token for the ops/reviewer-admin account (see DEFAULT_OPS_USERNAME above) - only used by
// assignProposalToPanel's own direct API calls, see the file header comment.
export const fetchLiveOpsToken = () =>
  withEnv((envOr) =>
    fetchLiveIndigoToken({
      username: envOr('INDIGO_OPS_USERNAME', DEFAULT_OPS_USERNAME),
      password: envOr('INDIGO_OPS_PASSWORD', DEFAULT_OPS_PASSWORD)
    })
  );

const decodeJwtPart = (part) => {
  const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
  const bytes = Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
};

const encodeJwtPart = (value) => {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

// The password grant's id_token is issued to the test client, but MSAL checks that it was issued
// to the app's own client and carries the nonce MSAL sent to /authorize. MSAL.js doesn't check
// id_token signatures (it got the token straight from the token endpoint), so the claims can be
// changed. The access token, which is what ska-oso-services checks, is not changed.
const rewriteIdToken = (idToken, claims) => {
  const [header, payload, signature] = idToken.split('.');
  return [header, encodeJwtPart({ ...decodeJwtPart(payload), ...claims }), signature].join('.');
};

// Answers the Indigo endpoints MSAL calls in the browser, for the rest of the current test:
// - /authorize (loginRedirect, and the hidden iframe acquireTokenSilent uses when it has no
//   refresh token) redirects back to the app's redirect_uri with a code and MSAL's own state
// - /token is turned into a password grant for the test user and sent to the real Indigo, so
//   every token MSAL gets is genuine and current. That includes the forced refresh after creating
//   a proposal, whose new token carries the new group membership
// Indigo's password grant doesn't return a refresh token, so every token MSAL asks for goes
// through both endpoints.
const interceptIndigo = ({ username, password }) =>
  withEnv((envOr) => {
    let nonce;

    cy.intercept({ method: 'GET', url: `${INDIGO_IAM_AUTHORIZE_URL}*` }, (req) => {
      const params = new URL(req.url).searchParams;
      nonce = params.get('nonce');
      const response = new URLSearchParams({ code: 'cypress', state: params.get('state') });
      const separator = params.get('response_mode') === 'query' ? '?' : '#';
      req.reply({
        statusCode: 302,
        headers: { location: `${params.get('redirect_uri')}${separator}${response}` }
      });
    }).as('indigoAuthorize');

    // MSAL adds query parameters (audience, client-request-id, ...) to the token URL
    cy.intercept({ method: 'POST', url: `${INDIGO_IAM_TOKEN_URL}*` }, (req) => {
      const appClientId = new URLSearchParams(req.body).get('client_id');
      const origin = req.headers.origin;
      const clientId = envOr('INDIGO_TEST_CLIENT_ID', DEFAULT_CLIENT_ID);
      const clientSecret = envOr('INDIGO_TEST_CLIENT_SECRET', DEFAULT_CLIENT_SECRET);
      req.headers.authorization = `Basic ${btoa(`${clientId}:${clientSecret}`)}`;
      req.body = new URLSearchParams({
        grant_type: 'password',
        username,
        password,
        scope: envOr('INDIGO_TEST_SCOPE', DEFAULT_SCOPE),
        audience: envOr('INDIGO_TEST_AUDIENCE', DEFAULT_AUDIENCE)
      }).toString();
      req.continue((res) => {
        if (res.body?.id_token) {
          res.body.id_token = rewriteIdToken(res.body.id_token, { aud: appClientId, nonce });
        }
        if (origin) {
          res.headers['access-control-allow-origin'] = origin;
        }
      });
    }).as('indigoToken');
  });

// ?use_indigo=true forces the app into Indigo auth mode via authConfig.ts's getUseIndigo(),
// whatever the deployment's own USE_INDIGO is set to - otherwise MSAL would be set up for the
// Entra/Microsoft authority and none of the intercepts above would match. getUseIndigo() keeps
// the choice in sessionStorage, which cy.session() snapshots.
const loginThroughApp = () => {
  cy.visit('/?use_indigo=true');
  cy.get('[data-testid="loginButton"]', { timeout: 15000 }).first().click();
  cy.wait('@indigoToken', { timeout: 20000 });
  cy.get('[data-testid="usernameMenu"]', { timeout: 15000 }).should('exist');
};

// Log in again if the cached access token expires within this time
const TOKEN_EXPIRY_MARGIN_SECONDS = 5 * 60;

// The saved session is only worth reusing while its access token is valid. MSAL keeps its cache
// unencrypted in session storage, with expiresOn in seconds, so this reads it without loading the app
const hasUnexpiredAccessToken = (storageByOrigin) => {
  const expiryTimes = Object.values(storageByOrigin)
    .flatMap((storage) => Object.values(storage))
    .map((value) => {
      try {
        return JSON.parse(value);
      } catch {
        return null;
      }
    })
    .filter((entry) => entry?.credentialType === 'AccessToken')
    .map((entry) => Number(entry.expiresOn));
  const now = Math.floor(Date.now() / 1000);
  return expiryTimes.some((expiresOn) => expiresOn - now > TOKEN_EXPIRY_MARGIN_SECONDS);
};

// cy.session() snapshots the resulting localStorage/sessionStorage (where MSAL's own token cache
// lives) keyed by username and reuses it - including across spec files within the same
// `cypress run`/worker process (cacheAcrossSpecs) - so only the first login of a given account
// per worker goes through the login redirect at all.
const loginWithSession = (username) => {
  cy.session(['intercepted-indigo-login', username], loginThroughApp, {
    cacheAcrossSpecs: true,
    validate() {
      cy.getAllSessionStorage({ log: false }).then(hasUnexpiredAccessToken);
    }
  });
};

// Known live IAM test accounts, keyed by the username a user fixture in users.js names via its
// own `username` field - add an entry here (and point a fixture at it) when a scenario needs its
// own distinctly-provisioned account, rather than toggling a boolean between exactly two
// hardcoded accounts.
const ACCOUNTS = {
  [DEFAULT_USERNAME]: {
    usernameEnvKey: 'INDIGO_TEST_USERNAME',
    passwordEnvKey: 'INDIGO_TEST_PASSWORD',
    defaultPassword: DEFAULT_PASSWORD
  },
  [DEFAULT_OPS_USERNAME]: {
    usernameEnvKey: 'INDIGO_OPS_USERNAME',
    passwordEnvKey: 'INDIGO_OPS_PASSWORD',
    defaultPassword: DEFAULT_OPS_PASSWORD
  }
};

export const loginAsUser = (username) => {
  const account = ACCOUNTS[username];
  if (!account) {
    throw new Error(
      `No live IAM credentials configured for Cypress test user "${username}" - add one to ACCOUNTS in auth.js.`
    );
  }
  return withEnv((envOr) => {
    const workerUsername =
      username === DEFAULT_USERNAME
        ? WORKER_USERNAMES[Number(envOr('WORKER_INDEX', '0')) % WORKER_USERNAMES.length]
        : username;
    const resolvedUsername = envOr(account.usernameEnvKey, workerUsername);
    const password = envOr(account.passwordEnvKey, account.defaultPassword);
    // Registered outside cy.session() so they also answer token requests made later in the test,
    // when the session is restored rather than created
    interceptIndigo({ username: resolvedUsername, password });
    return loginWithSession(resolvedUsername);
  });
};
