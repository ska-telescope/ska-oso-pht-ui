import { reviewerAdmin } from '../../users/users.js';
import {
  clearLocalStorage,
  mockEmailAPI,
  mockGetUserByEmailAPI,
  pageConfirmed,
  initialize,
  clickUserSearch,
  // clickPICheckbox,
  clickSendInviteButton,
  verifyUserFoundAlertFooter,
  verifyUserInvitedAlertFooter,
  clickManageTeamMemberRights,
  clickSubmitRights,
  clickDialogConfirm,
  verifyTeamMemberAccessUpdatedAlertFooter,
  createScienceIdeaLoggedIn,
  mockCreateSubmissionAPI,
  verifySubmissionCreatedAlertFooter
} from '../../common/common.js';
import { entry } from '../../../fixtures/utils/cypress.js';

describe('Delegate Editing Rights', () => {
  beforeEach(() => {
    initialize(reviewerAdmin);
    mockCreateSubmissionAPI();
    mockGetUserByEmailAPI();
    mockEmailAPI();
    createScienceIdeaLoggedIn();
    cy.wait('@mockCreateSubmission');
    verifySubmissionCreatedAlertFooter();
    pageConfirmed('TEAM');
  });

  afterEach(() => {
    clearLocalStorage();
  });

  it('Delegate editing rights to a Co-Investigator', { jiraKey: 'XTP-89609' }, () => {
    entry('email', 'Trevor.Swain@community.skao.int');
    clickUserSearch();
    // cy.wait('@mockGetUserByEmailAPI'); // TODO see if this is needed
    verifyUserFoundAlertFooter();
    // clickPICheckbox();
    clickSendInviteButton();
    cy.wait('@mockInviteUserByEmail');
    verifyUserInvitedAlertFooter();
    clickManageTeamMemberRights();
    clickSubmitRights();
    clickDialogConfirm();
    // This can fail as it's waiting upon a response for too long.   verifyTeamMemberAccessUpdatedAlertFooter();
  });
});
