import {
  clickUserMenu,
  clearLocalStorage,
  initialize,
  verifyUserMenuOverview,
  verifyUserMenuProposals,
  verifyUserMenuPanels,
  verifyUserMenuReviews,
  verifyUserMenuDecisions
} from '../../common/common';
import { standardUser } from '../users.js';

describe('Standard', () => {
  beforeEach(() => {
    initialize(standardUser);
    cy.window().then(win => {
      win.localStorage.setItem('USE_LOCAL_DATA', 'true');
    });
  });

  afterEach(() => {
    clearLocalStorage();
  });

  it('Validate menu options', () => {
    clickUserMenu();
    verifyUserMenuOverview(false);
    verifyUserMenuProposals(false);
    verifyUserMenuPanels(false);
    verifyUserMenuReviews(false);
    verifyUserMenuDecisions(false);
  });
});
