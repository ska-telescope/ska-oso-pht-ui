import {
  clickUserMenu,
  clearLocalStorage,
  visitWithAuth,
  verifyUserMenuOverview,
  verifyUserMenuProposals,
  verifyUserMenuPanels,
  verifyUserMenuReviews,
  verifyUserMenuDecisions
} from '../../common/common';
import { standardUser } from '../users.js';

describe('Standard', () => {
  beforeEach(() => {
    visitWithAuth(standardUser);
  });

  afterEach(() => {
    clearLocalStorage();
  });

  it('Validate menu options', () => {
    clickUserMenu();
    verifyUserMenuOverview(false);
    verifyUserMenuProposals(true);
    verifyUserMenuPanels(false);
    verifyUserMenuReviews(false);
    verifyUserMenuDecisions(false);
  });
});
