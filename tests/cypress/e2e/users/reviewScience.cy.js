import {
  clearLocalStorage,
  clickUserMenu,
  clickUserMenuProposals,
  clickUserMenuReviews,
  visitWithAuth,
  verifyUserMenuOverview,
  verifyUserMenuProposals,
  verifyUserMenuPanels,
  verifyUserMenuReviews,
  verifyUserMenuDecisions,
  mockOSDAPI
} from '../../support/common';
import { reviewerScience } from '../../support/users';

describe('Reviewer ( Science )', () => {
  describe('Menu', () => {
    beforeEach(() => {
      // The review list's title/wording is derived from the reviewed proposal's own cycle (see
      // ReviewListPage.tsx) - OSD cycle data must be mocked for that lookup to resolve.
      mockOSDAPI();
      visitWithAuth(reviewerScience);
      cy.wait('@mockOSDData');
    });

    afterEach(() => {
      clearLocalStorage();
    });

    //TODO Provision an 'Science Reviewer' test user and then reenable (see users.js).
    it.skip('Validate menu options', () => {
      clickUserMenu();
      verifyUserMenuOverview(false);
      verifyUserMenuProposals(true);
      verifyUserMenuPanels(false);
      verifyUserMenuReviews(true);
      verifyUserMenuDecisions(false);
    });

    it.skip('Navigate using the dropdown menu', () => {
      clickUserMenuProposals();
      clickUserMenuReviews();
    });
  });

  describe('Perform a review', () => {
    // TODO: Write the review flow once it can run. Create, fill and submit an SV proposal as the
    //  SV editor tests do (createProposal, fillPages, validateAndSubmit), assign it to a panel
    //  through /panels/assignments, then review it as the science reviewer. It can't run yet: the
    //  local and CI deploys use a Prism mock of the User Portal (see
    //  charts/ska-oso-services-umbrella/templates/mock-user-portal.yaml), which never grants the
    //  creator real group membership, so the panel calls return 403.
    it.skip(
      'Science Verification: Perform a review, then validate and submit',
      {
        jiraKey: 'XTP-96332'
      },
      () => {}
    );
  });
});
