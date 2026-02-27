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
  clickIconForRow,
  clickToValidateSV,
  verifyAlertFooter,
  clickFeasibilityYes
} from '../../common/common';
import { reviewerTechnical } from '../users';
// PMT Flows are under review, scenarios will be updated when functionality is finalised
describe('Reviewer ( Technical )', () => {
  beforeEach(() => {
    initialize(reviewerTechnical);
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
    () => {
      clickUserMenuReviews();
      //Click on the review for the submission "In a galaxy far, far away"
      clickIconForRow('dataGridId', 'BuildIcon', 'In a galaxy far, far away');
      //select feasibility
      clickFeasibilityYes();
      //click validate / submit
      clickToValidateSV();
      verifyAlertFooter('Review record has been updated');
    }
  );
});
