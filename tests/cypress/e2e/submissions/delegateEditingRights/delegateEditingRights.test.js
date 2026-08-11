import { reviewerAdmin } from '../../users/users.js';
import {
  clearLocalStorage,
  mockEmailAPI,
  mockGetUserByEmailAPI,
  clickUserSearch,
  clickSendInviteButton,
  verifyUserFoundAlertFooter,
  verifyUserInvitedAlertFooter,
  clickSubmitRights,
  clickDialogConfirm,
  verifyTeamMemberAccessUpdatedAlertFooter,
  clickEditUserRightsIconForRow,
  mockCreateProposalAccessAPI,
  createScienceIdeaSession
} from '../../common/common.js';
import { entry } from '../../../fixtures/utils/cypress.js';

describe('Delegate Editing Rights', () => {
  beforeEach(() => {
    mockGetUserByEmailAPI();
    mockEmailAPI();
    mockCreateProposalAccessAPI();
  });

  afterEach(() => {
    clearLocalStorage();
  });

  it('SV Flow: Delegate editing rights to a Co-Investigator', { jiraKey: 'XTP-89609' }, () => {
    createScienceIdeaSession(reviewerAdmin);
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
