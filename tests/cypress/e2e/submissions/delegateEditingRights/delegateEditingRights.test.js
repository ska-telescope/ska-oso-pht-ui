import { reviewerAdmin } from '../../users/users.js';
import {
  clearLocalStorage,
  mockEmailAPI,
  mockGetUserByEmailAPI,
  pageConfirmed,
  initialize,
  clickUserSearch,
  clickSendInviteButton,
  verifyUserFoundAlertFooter,
  verifyUserInvitedAlertFooter,
  clickSubmitRights,
  clickDialogConfirm,
  createScienceIdeaLoggedIn,
  verifyScienceIdeaCreatedAlertFooter,
  verifyTeamMemberAccessUpdatedAlertFooter,
  mockCreateSVIdeaAPI,
  clickEditUserRightsIconForRow
} from '../../common/common.js';
import { entry } from '../../../fixtures/utils/cypress.js';

describe('Delegate Editing Rights', () => {
  beforeEach(() => {
    initialize(reviewerAdmin);
    mockCreateSVIdeaAPI();
    mockGetUserByEmailAPI();
    mockEmailAPI();
  });

  afterEach(() => {
    clearLocalStorage();
  });

  it('SV Flow: Delegate editing rights to a Co-Investigator', { jiraKey: 'XTP-89609' }, () => {
    createScienceIdeaLoggedIn();
    cy.wait('@mockCreateSVIdea');
    verifyScienceIdeaCreatedAlertFooter();
    pageConfirmed('TEAM');
    entry('email', 'Trevor.Swain@community.skao.int');
    clickUserSearch();
    verifyUserFoundAlertFooter();
    clickSendInviteButton();
    cy.wait('@mockInviteUserByEmail');
    verifyUserInvitedAlertFooter();
    clickEditUserRightsIconForRow('investigatorsTableId', 'Trevor');
    clickSubmitRights();
    clickDialogConfirm();
    verifyTeamMemberAccessUpdatedAlertFooter();
  });
});
