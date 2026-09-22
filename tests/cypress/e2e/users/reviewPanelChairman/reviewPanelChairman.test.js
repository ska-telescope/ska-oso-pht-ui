import {
  clearLocalStorage,
  clickUserMenu,
  clickUserMenuProposals,
  clickUserMenuDecisions,
  initialize,
  verifyUserMenuOverview,
  verifyUserMenuProposals,
  verifyUserMenuPanels,
  verifyUserMenuReviews,
  verifyUserMenuDecisions
} from '../../common/common';
import { reviewerChairman } from '../users.js';

describe('Review Chairman', () => {
  beforeEach(() => {
    initialize(reviewerChairman);
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
