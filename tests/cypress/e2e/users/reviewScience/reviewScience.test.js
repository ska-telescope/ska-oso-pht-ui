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
  clickConfirmButtonWithinPopup,
  clickRank9,
  clickGeneralCommentsTab,
  clickToValidateSV,
  verifyAlertFooter
} from '../../common/common';
import { reviewerScience } from '../users';
import { entry } from '../../../fixtures/utils/cypress.js';

// PMT Flows are under review, scenarios will be updated when functionality is finalised
describe('Reviewer ( Science )', () => {
  beforeEach(() => {
    initialize(reviewerScience);
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
  it('Science Verification: Perform a review, then validate and submit', () => {
    clickUserMenuReviews();
    //Click on the review for the submission "In a galaxy far, far away"
    clickIconForRow('dataGridId', 'scienceIcon', 'In a galaxy far, far away');
    //confirm no conflict of interest
    clickConfirmButtonWithinPopup();
    //select rank and add general comments
    clickRank9();
    clickGeneralCommentsTab('General Comments');
    entry('generalCommentsId', 'This is a general comment for the submission');
    //click validate / submit
    clickToValidateSV();
    verifyAlertFooter('Review record has been updated');
  });
});
