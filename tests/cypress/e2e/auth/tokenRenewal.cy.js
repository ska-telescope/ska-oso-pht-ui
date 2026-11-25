// Checks the forced token renewal the app does after creating a proposal (postProposal.tsx calls
// refreshAuthToken(), which asks MSAL for a new token with forceRefresh). refreshAuthToken()
// ignores errors and leaves the old token in place, so the creation specs would still pass if the
// renewal failed. This spec fails if it does.
//
// The renewal goes through the real Indigo token exchange: support/auth.js's @indigoToken
// intercept only rewrites the request into a password grant and passes the real response on.
import {
  beginScienceIdeaSession,
  clearLocalStorage,
  clickHome,
  completeScienceIdeaCreation,
  selectScienceVerificationCycle
} from '../../support/common.js';
import { standardUser } from '../../support/users.js';

// MSAL keeps its token cache unencrypted in session storage. Access token entries have
// credentialType 'AccessToken' and the token itself in `secret`.
const cachedAccessTokens = (win) =>
  Object.keys(win.sessionStorage)
    .map((key) => {
      try {
        return JSON.parse(win.sessionStorage.getItem(key));
      } catch {
        return null;
      }
    })
    .filter((entry) => entry?.credentialType === 'AccessToken')
    .map((entry) => entry.secret);

describe('Access token renewal', () => {
  afterEach(() => {
    clearLocalStorage();
  });

  it('gets a new token from Indigo after creating a proposal, and uses it for later requests', () => {
    let tokensBefore;
    let tokenRequestsBefore;
    let renewedToken;

    beginScienceIdeaSession(standardUser);
    selectScienceVerificationCycle();

    cy.window().then((win) => {
      tokensBefore = cachedAccessTokens(win);
      expect(tokensBefore, 'access token cached before renewal').to.not.be.empty;
    });
    cy.get('@indigoToken.all').then((requests) => {
      tokenRequestsBefore = requests.length;
    });

    completeScienceIdeaCreation();

    // Indigo issued a new token
    cy.get('@indigoToken.all', { timeout: 30000 })
      .should((requests) => {
        expect(requests.length, 'token requests since creating the proposal').to.be.greaterThan(
          tokenRequestsBefore
        );
        expect(requests[requests.length - 1].response, 'renewal response').to.exist;
      })
      .then((requests) => {
        const { response } = requests[requests.length - 1];
        expect(response.statusCode, 'renewal status').to.eq(200);
        renewedToken = response.body.access_token;
        expect(renewedToken, 'renewed access token').to.be.a('string').and.not.be.empty;
        expect(tokensBefore, 'previous access tokens').to.not.include(renewedToken);
      });

    // MSAL accepted it into its cache
    cy.window().should((win) => {
      expect(cachedAccessTokens(win), 'MSAL cached access tokens').to.include(renewedToken);
    });

    // The next backend request uses it, and the backend accepts it
    cy.intercept('GET', '**/pht/prsls/mine').as('myProposals');
    clickHome();
    cy.wait('@myProposals', { timeout: 30000 }).then(({ request, response }) => {
      expect(request.headers.authorization, 'token sent to the backend').to.eq(
        `Bearer ${renewedToken}`
      );
      expect(response.statusCode, 'backend response').to.be.lessThan(400);
    });
  });
});
