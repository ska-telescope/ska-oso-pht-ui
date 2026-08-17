// Fetches a real access token from the staging Indigo IAM instance, so specs can run
// against a live backend with a genuine JWT instead of a fake `cypress:token` string and
// stubbed responses. Mirrors ska-oso-services' own live-test fixture (tests/live/conftest.py
// in that repo), NOT ska-aaa-authhelpers' generic one - ska-aaa-authhelpers' test client is
// only authorized for the 'openid profile' scopes, which ska-oso-services' write endpoints
// reject ("Authorization scopes must include at least one of: ['Scope.PHT_READWRITE']").
// ska-oso-services' own client is a confidential client specifically granted pht:read/
// pht:readwrite for password-grant (ROPC) use - the app's own public SPA client
// (INDIGO_CLIENT_ID in authConfig.ts) can't be used here at all, it's Authorization
// Code+PKCE only and rejects the password grant outright.
//
// Toggle live mode for a run with CYPRESS_LIVE_AUTH=true, or per-spec/describe with
// `Cypress.env('LIVE_AUTH', true)`. Everything below is inert (never invoked) when it's off,
// which is the default.

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

// A real, directory-registered member to look up/delegate to (e.g. delegateEditingRights), in
// place of the fake fixture user (Trevor Swain) that only exists in mocked mode. This has to be
// a real community.skao.int identity that the backend's member-lookup endpoint can actually
// find via Microsoft Graph - the Indigo IAM staging login accounts (astronomer1/astronomer2,
// @example.edu) aren't registered in that directory and never resolve here, regardless of which
// one is used or whether it's the same account doing the creating. Confirmed working directly
// against the integration environment's real backend.
const DEFAULT_MEMBER_EMAIL = 'mark.nicol@community.skao.int';
const DEFAULT_MEMBER_FIRST_NAME = 'Mark';

export const isLiveMode = () => Cypress.env('LIVE_AUTH') === true;

const envOr = (key, fallback) => Cypress.env(key) || fallback;

export const liveMemberEmail = () => envOr('LIVE_MEMBER_EMAIL', DEFAULT_MEMBER_EMAIL);
export const liveMemberFirstName = () => envOr('LIVE_MEMBER_FIRST_NAME', DEFAULT_MEMBER_FIRST_NAME);

export const fetchLiveIndigoToken = () =>
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
        username: envOr('INDIGO_TEST_USERNAME', DEFAULT_USERNAME),
        password: envOr('INDIGO_TEST_PASSWORD', DEFAULT_PASSWORD),
        scope: envOr('INDIGO_TEST_SCOPE', DEFAULT_SCOPE),
        audience: envOr('INDIGO_TEST_AUDIENCE', DEFAULT_AUDIENCE)
      },
      timeout: 15000
    })
    .then((response) => response.body.access_token);

// Registers a network intercept that stubs a response in the default (mocked) mode, same as
// before. In live mode it registers the same alias as a passthrough spy instead - the real
// request goes to the real backend untouched, but cy.wait('@alias') keeps working unchanged,
// so a spec doesn't need its waits rewritten just because its mocks were switched off.
export const intercept = (method, url, aliasName, installStub) => {
  if (isLiveMode()) {
    cy.intercept(method, url).as(aliasName);
  } else {
    installStub();
  }
};
