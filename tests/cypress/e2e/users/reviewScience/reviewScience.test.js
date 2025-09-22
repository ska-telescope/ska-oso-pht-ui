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
  verifyUserMenuDecisions
} from '../../common/common';
import { reviewerScience } from '../users';

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
  it('Perform a review', () => {
    clickUserMenuReviews();
    // TODO : Perhaps do some stuff in here ?
  });
});
