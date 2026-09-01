// Real MSAL sessions for Cypress specs, so tests exercise the app's actual auth code paths
// instead of a fake bypass.
//
// loginAsIndigoUser/loginAsOpsUser (used by almost every spec, via common.js's initialize()) seed
// MSAL's cache instantly from a real token - fast, and indistinguishable from a real login to the
// rest of the app. See hydrateIndigoSession's own comment below for how/why that works (it
// bypasses Indigo's login/consent HTML forms via direct API calls rather than cy.origin() -
// cy.origin() turned out to be unreliable for this, see its comment for why).
// fetchLiveIndigoToken/fetchLiveOpsToken are separate - kept only for assignProposalToPanel's own
// API fixture setup. Also see axiosAuthClient.ts's __msalLoadExternalTokens hook.
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

// A real, directory-registered member to look up/delegate to (e.g. delegateEditingRights), in
// place of the fake fixture user (Trevor Swain) that only existed in the old stub/mock mode. This
// has to be a real community.skao.int identity that the backend's member-lookup endpoint can
// actually find via Microsoft Graph - the Indigo IAM staging login accounts (astronomer1/
// astronomer2, @example.edu) aren't registered in that directory and never resolve here,
// regardless of which one is used or whether it's the same account doing the creating. Confirmed
// working directly against the integration environment's real backend.
const DEFAULT_MEMBER_EMAIL = 'mark.nicol@community.skao.int';
const DEFAULT_MEMBER_FIRST_NAME = 'Mark';

const envOr = (key, fallback) => Cypress.env(key) || fallback;

export const liveMemberEmail = () => envOr('LIVE_MEMBER_EMAIL', DEFAULT_MEMBER_EMAIL);
export const liveMemberFirstName = () => envOr('LIVE_MEMBER_FIRST_NAME', DEFAULT_MEMBER_FIRST_NAME);

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
