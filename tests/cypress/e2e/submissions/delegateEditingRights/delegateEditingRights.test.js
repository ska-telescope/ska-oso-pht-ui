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
  clickEditUserRightsIconForRow,
  mockCreateProposalAccessAPI,
  mockOSDAPI
} from '../../common/common.js';
import { entry } from '../../../fixtures/utils/cypress.js';

describe('Delegate Editing Rights', () => {
  beforeEach(() => {
    initialize(reviewerAdmin);
    mockOSDAPI();
    mockCreateSVIdeaAPI();
    mockGetUserByEmailAPI();
    mockEmailAPI();
    mockCreateProposalAccessAPI();
  });

  afterEach(() => {
    clearLocalStorage();
  });

  it('SV Flow: Delegate editing rights to a Co-Investigator', { jiraKey: 'XTP-89609' }, () => {
    cy.wait('@mockOSDData');
    createScienceIdeaLoggedIn();
    cy.wait('@mockCreateSVIdea');
    verifyScienceIdeaCreatedAlertFooter();
    pageConfirmed('TEAM');
    entry('email', 'Trevor.Swain@community.skao.int');
    clickUserSearch();
    verifyUserFoundAlertFooter();
    clickSendInviteButton();
    verifyUserInvitedAlertFooter();
    cy.wait('@mockInviteUserByEmail');
    cy.wait('@mockCreateProposalAccessAPI');
    clickEditUserRightsIconForRow('investigatorsTableId', 'Trevor');
    clickSubmitRights();
    clickDialogConfirm();
    verifyTeamMemberAccessUpdatedAlertFooter();
  });
});
