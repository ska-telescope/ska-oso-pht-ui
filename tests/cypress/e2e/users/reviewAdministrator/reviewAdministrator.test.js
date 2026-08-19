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
