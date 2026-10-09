import {
  clearLocalStorage,
  clickUserMenu,
  clickUserMenuProposals,
  clickUserMenuDecisions,
  visitWithAuth,
  verifyUserMenuOverview,
  verifyUserMenuProposals,
  verifyUserMenuPanels,
  verifyUserMenuReviews,
  verifyUserMenuDecisions
} from '../../common/common';
import { reviewerChairman } from '../users.js';

describe('Review Chairman', () => {
  beforeEach(() => {
    visitWithAuth(reviewerChairman);
  });

  afterEach(() => {
    clearLocalStorage();
  });

  // TODO Provision a 'Chair' test user and then reenable (see users.js).
  it.skip('Validate menu options', () => {
    clickUserMenu();
    verifyUserMenuOverview(false);
    verifyUserMenuProposals(true);
    verifyUserMenuPanels(false);
    verifyUserMenuReviews(false);
    verifyUserMenuDecisions(true);
  });

  it.skip('Navigate using the dropdown menu', () => {
    clickUserMenuDecisions();
    clickUserMenuProposals();
  });
});
