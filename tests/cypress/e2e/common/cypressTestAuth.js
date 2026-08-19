// Fetches a real access token from the staging Indigo IAM instance, so specs run against a live
// backend with a genuine JWT instead of a fake `cypress:token` string and stubbed responses.
// Mirrors ska-oso-services' own live-test fixture (tests/live/conftest.py in that repo), NOT
// ska-aaa-authhelpers' generic one - ska-aaa-authhelpers' test client is only authorized for the
// 'openid profile' scopes, which ska-oso-services' write endpoints reject ("Authorization scopes
// must include at least one of: ['Scope.PHT_READWRITE']"). ska-oso-services' own client is a
// confidential client specifically granted pht:read/pht:readwrite for password-grant (ROPC) use -
// the app's own public SPA client (INDIGO_CLIENT_ID in authConfig.ts) can't be used here at all,
// it's Authorization Code+PKCE only and rejects the password grant outright.
//
// The suite always runs against a live backend now - there is no stubbed/mocked mode any more.

const INDIGO_IAM_TOKEN_URL = 'https://iam-1.staging.devx.skao.int/token';

// Non-secret test credentials for an isolated staging environment - the same defaults
// ska-oso-services itself commits to its public repo. Override via CYPRESS_INDIGO_TEST_*
// env vars (or cypress.env.json) to point at a different IAM user/client.
const DEFAULT_CLIENT_ID = '436915fe-7d98-487a-93b2-b3d5f9bc5952';
const DEFAULT_CLIENT_SECRET =
  'AOzHcqR2tz5sfZSOPmuQ4CU6VDQmUSSJCHZLEpMUHhRADvhh4og_XD8SNDGVI4uYA4QN_QVS4nS9AB_tT9IQd-0';
const DEFAULT_USERNAME = 'astronomer1';
const DEFAULT_PASSWORD = 'test';
// Matches this app's own INDIGO_AUDIENCE/INDIGO_SCOPE (see authConfig.ts / Makefile's
// dev-start).
const DEFAULT_AUDIENCE = 'test:pht';
const DEFAULT_SCOPE = 'openid profile pht:read pht:readwrite';

// A second live IAM account (Ralph Copeland), granted app:pht:ops_proposal_admin,
// app:pht:ops_reviewer_science and app:pht:ops_reviewer_technical - astronomer1 has none of
// these, so this is used only for the review/panel-admin flow (see reviewScience.test.js),
// which needs them. Everything else keeps using astronomer1.
const DEFAULT_OPS_USERNAME = 'sciops1';
const DEFAULT_OPS_PASSWORD = 'test';

const envOr = (key, fallback) => Cypress.env(key) || fallback;

export const fetchLiveIndigoToken = ({ username, password } = {}) =>
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
    .then((response) => response.body.access_token);

// Token for the ops/reviewer-admin account (see DEFAULT_OPS_USERNAME above).
export const fetchLiveOpsToken = () =>
  fetchLiveIndigoToken({
    username: envOr('INDIGO_OPS_USERNAME', DEFAULT_OPS_USERNAME),
    password: envOr('INDIGO_OPS_PASSWORD', DEFAULT_OPS_PASSWORD)
  });

// Emulates the app's own forced token refresh (see axiosAuthClient.ts's refreshAuthToken, called
// after creating a proposal/panel) for the Cypress token-bypass path. Real MSAL/Indigo would
// fetch a fresh token reflecting group membership ska-oso-services' create_membership just
// granted; the bypass instead reads whatever's in localStorage on every request (see
// src/services/axios/authToken/localAuthToken.ts's getLocalToken), so this re-fetches a token for
// whichever user is currently logged in (cypress:account, set by visitWithAuth) and overwrites it
// in place - no page reload needed, unlike initialize().
export const refreshLiveToken = () => {
  cy.window().then((win) => {
    const user = JSON.parse(win.localStorage.getItem('cypress:account') || '{}');
    const fetchToken = user.liveOps ? fetchLiveOpsToken : fetchLiveIndigoToken;
    fetchToken().then((token) => {
      win.localStorage.setItem('cypress:token', token);
    });
  });
};
