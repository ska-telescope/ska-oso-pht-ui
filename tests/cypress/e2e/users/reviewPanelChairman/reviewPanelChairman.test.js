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

  // APP_OVERRIDE_GROUPS (the local-only group-override flag) was removed - all four reviewer role
  // fixtures (see users.js) now log in as the same real sciops1 account, which doesn't hold every
  // reviewer/chair/admin IAM group simultaneously, so the role-gated menu items these two tests
  // check don't reliably render. Not a test-code fix - re-enable once dedicated per-role real IAM
  // test accounts are provisioned (see users.js's comment).
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
