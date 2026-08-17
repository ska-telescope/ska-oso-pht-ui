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
  createScienceIdeaSession,
  isLiveMode,
  liveMemberEmail,
  liveMemberFirstName
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

  it('SV Flow: Delegate editing rights to a Co-Investigator', { jiraKey: 'XTP-89609' }, function () {
    // This flow needs both the MS-Graph-backed member lookup and a real email send, and both
    // read a secret (OSO_CLIENT_SECRET / PHT_EMAIL_*) sourced from Vault in a proper deployment.
    // Our local minikube deploy of ska-oso-services runs with vault.enabled=false (see its
    // Makefile), which injects dummy placeholder secrets instead, so both calls fail
    // server-side regardless of which real member email is searched for. Skip until that's
    // addressed; this isn't a test-code fix.
    if (isLiveMode()) {
      this.skip();
    }
    createScienceIdeaSession(reviewerAdmin);
    // The fixture user (Trevor Swain) only exists in mocked mode - in live mode the real
    // backend is searched for a known directory-registered member instead (see liveAuth.js).
    const email = isLiveMode() ? liveMemberEmail() : 'Trevor.Swain@community.skao.int';
    const firstName = isLiveMode() ? liveMemberFirstName() : 'Trevor';
    entry('email', email);
    clickUserSearch();
    verifyUserFoundAlertFooter();
    clickSendInviteButton();
    verifyUserInvitedAlertFooter();
    cy.wait('@mockInviteUserByEmail');
    cy.wait('@mockCreateProposalAccessAPI');
    clickEditUserRightsIconForRow('investigatorsTableId', firstName);
    clickSubmitRights();
    clickDialogConfirm();
    verifyTeamMemberAccessUpdatedAlertFooter();
  });
});
