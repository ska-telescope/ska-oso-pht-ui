import { reviewerAdmin } from '../../users/users.js';
import {
  clearLocalStorage,
  createStandardProposalLoggedIn,
  mockCreateProposalAPI,
  mockEmailAPI,
  mockGetUserByEmailAPI,
  pageConfirmed,
  initialize,
  verifyProposalCreatedAlertFooter,
  clickUserSearch,
  clickPICheckbox,
  clickSendInviteButton,
  verifyUserFoundAlertFooter,
  verifyUserInvitedAlertFooter,
  clickManageTeamMemberRights,
  clickSubmitRights,
  clickDialogConfirm,
  verifyTeamMemberAccessUpdatedAlertFooter
} from '../../common/common.js';
import { entry } from '../../../fixtures/utils/cypress.js';

describe('Delegate Editing Rights', () => {
  beforeEach(() => {
    initialize(reviewerAdmin);
    mockCreateProposalAPI();
    cy.window().then(win => {
      win.localStorage.setItem('cypress:defaultUserLoggedIn', 'true');
    });
    mockGetUserByEmailAPI();
    mockEmailAPI();
    createStandardProposalLoggedIn();
    cy.wait('@mockCreateProposal');
    verifyProposalCreatedAlertFooter();
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
    clickPICheckbox();
    clickSendInviteButton();
    cy.wait('@mockInviteUserByEmail');
    verifyUserInvitedAlertFooter();
    clickManageTeamMemberRights();
    clickSubmitRights();
    clickDialogConfirm();
    verifyTeamMemberAccessUpdatedAlertFooter();
  });
});
