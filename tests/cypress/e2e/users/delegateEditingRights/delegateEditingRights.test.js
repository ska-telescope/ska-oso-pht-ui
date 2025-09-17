import { defaultUser } from '../users.js';
import {
  clearLocalStorage,
  createStandardProposalLoggedIn,
  mockCreateProposalAPI,
  mockEmailAPI,
  pageConfirmed,
  initialize,
  verifyProposalCreatedAlertFooter,
  clickSearchForMember,
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
    initialize(defaultUser);
    mockCreateProposalAPI();
    cy.window().then(win => {
      win.localStorage.setItem('cypress:defaultUserLoggedIn', 'true');
    });
    mockEmailAPI();
    createStandardProposalLoggedIn();
    cy.wait('@mockCreateProposal');
    verifyProposalCreatedAlertFooter();
    pageConfirmed('TEAM');
  });

  afterEach(() => {
    clearLocalStorage();
  });

  it('XTP-89609 Delegate editing rights to a co-investigator', { jiraKey: 'XTP-89609' }, () => {
    clickSearchForMember();
    entry('email', 'Trevor.Swain@community.skao.int');
    clickUserSearch();
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
