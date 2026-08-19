import {
  clearLocalStorage,
  clickUserMenu,
  clickUserMenuProposals,
  clickUserMenuReviews,
  initialize,
  verifyUserMenuOverview,
  verifyUserMenuProposals,
  verifyUserMenuPanels,
  verifyUserMenuReviews,
  verifyUserMenuDecisions,
  mockOSDAPI
} from '../../common/common';
import { reviewerTechnical } from '../users';
// PMT Flows are under review, scenarios will be updated when functionality is finalised
describe('Reviewer ( Technical )', () => {
  beforeEach(() => {
    // The review list's title/wording is derived from the reviewed proposal's own cycle (see
    // ReviewListPage.tsx) - OSD cycle data must be mocked for that lookup to resolve.
    mockOSDAPI();
    initialize(reviewerTechnical);
    cy.wait('@mockOSDData');
  });

  afterEach(() => {
    clearLocalStorage();
  });

  it('Validate menu options', () => {
    clickUserMenu();
    verifyUserMenuOverview(false);
    verifyUserMenuProposals(true);
    verifyUserMenuPanels(false);
    verifyUserMenuReviews(true);
    verifyUserMenuDecisions(false);
  });

  it('Navigate using the dropdown menu', () => {
    clickUserMenuProposals();
    clickUserMenuReviews();
  });

  it(
    'Science Verification: Perform a review, then validate and submit',
    { jiraKey: 'XTP-96341' },
    function () {
      // This clicked the mocked-only "In a galaxy far, far away" fixture proposal, which doesn't
      // exist in the real reviewable list - not yet converted to a real create/assign/review
      // flow (see reviewScience.test.js for why that's more involved than it looks: it needs a
      // real user-portal integration to grant real IAM group membership, which our local
      // minikube deploy can't provide). Skip until it is.
      this.skip();
    }
  );
});
