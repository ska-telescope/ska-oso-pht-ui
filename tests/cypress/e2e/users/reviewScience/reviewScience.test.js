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
  clickConfirmButtonWithinPopup
} from '../../common/common';
import { reviewerScience } from '../users';

// PMT Flows are under review, scenarios will be updated when functionality is finalised
describe('Reviewer ( Science )', () => {
  beforeEach(() => {
    initialize(reviewerScience);
  });

  afterEach(() => {
    clearLocalStorage();
  });

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
  it('Science Verification: Perform a review', () => {
    clickUserMenuReviews();
    //Click on the review for the submission "In a galaxy far, far away"
    clickIconForRow('dataGridId', 'scienceIcon', 'In a galaxy far, far away');
    //confirm no conflict of interest
    clickConfirmButtonWithinPopup();
  });
});
