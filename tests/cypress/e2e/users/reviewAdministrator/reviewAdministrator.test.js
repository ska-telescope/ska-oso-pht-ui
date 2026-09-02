import {
  clickUserMenu,
  clickUserMenuPanels,
  clickUserMenuProposals,
  initialize,
  clearLocalStorage,
  clickUserMenuOverview,
  verifyUserMenuOverview,
  verifyUserMenuProposals,
  verifyUserMenuPanels,
  verifyUserMenuReviews,
  verifyUserMenuDecisions
} from '../../common/common';
import { reviewerAdmin } from '../users.js';

describe('Review Administrator', () => {
  beforeEach(() => {
    initialize(reviewerAdmin);
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
    verifyUserMenuOverview(true);
    verifyUserMenuProposals(true);
    verifyUserMenuPanels(true);
    verifyUserMenuReviews(true);
    verifyUserMenuDecisions(true);
  });

  it.skip('Navigate using the dropdown menu', () => {
    clickUserMenuOverview();
    clickUserMenuPanels();
    clickUserMenuProposals();
  });

  // The following all still assert on MockPanelBackendList's specific fixture content ("The
  // Milky Way View", "Aisha") - not yet converted to handle a real backend's panel/reviewer data,
  // so skip until they are; this isn't a test-code fix for the fixture text itself.
  it('Display a list of proposals', function () {
    this.skip();
  });

  it('Display a list of reviewers', function () {
    this.skip();
  });

  it('Add a reviewer to a panel', function () {
    this.skip();
  });

  it('Add a proposal to a panel', function () {
    this.skip();
  });
});
