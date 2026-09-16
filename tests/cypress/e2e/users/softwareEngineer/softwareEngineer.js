import {
  clickUserMenu,
  clickUserMenuPanels,
  clickUserMenuProposals,
  clickUserMenuReviews,
  clickUserMenuDecisions,
  initialize,
  clearLocalStorage,
  clickUserMenuOverview,
  verifyUserMenuOverview,
  verifyUserMenuProposals,
  verifyUserMenuPanels,
  verifyUserMenuReviews,
  verifyUserMenuDecisions
} from '../../common/common.js';
import { reviewerAdmin } from '../users.js';

describe('Software Engineer', () => {
  beforeEach(() => {
    initialize(reviewerAdmin);
  });

  afterEach(() => {
    clearLocalStorage();
  });

  it('Validate menu options', () => {
    clickUserMenu();
    verifyUserMenuOverview(true);
    verifyUserMenuProposals(true);
    verifyUserMenuPanels(true);
    verifyUserMenuReviews(true);
    verifyUserMenuDecisions(true);
  });

  it('Navigate using the dropdown menu', () => {
    clickUserMenuOverview();
    clickUserMenuProposals();
    clickUserMenuPanels();
    clickUserMenuReviews();
    clickUserMenuDecisions();
  });
});
