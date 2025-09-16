import {
  checkFieldDisabled,
  clickAddProposal,
  clickCreateProposal,
  clickHome,
  clickDialogConfirm,
  clickProposalTypePrincipleInvestigator,
  clickSubProposalTypeTargetOfOpportunity,
  enterProposalTitle,
  verifyOnLandingPageNoProposalMsgIsVisible,
  verifyProposalCreatedAlertFooter,
  verifyHomeButtonWarningModal,
  initializeUserNotLoggedIn,
  clearLocalStorage
} from '../common/common';

describe('Creating Proposal without login', () => {
  beforeEach(() => {
    initializeUserNotLoggedIn();
  });

  afterEach(() => {
    clearLocalStorage();
  });

  it('Create a basic proposal without login', () => {
    cy.wait(500);
    clickAddProposal();
    enterProposalTitle();
    clickProposalTypePrincipleInvestigator();
    clickSubProposalTypeTargetOfOpportunity();
    clickCreateProposal();
    verifyProposalCreatedAlertFooter();
    checkFieldDisabled('saveBtn', true);
    checkFieldDisabled('validateBtn', true);
    clickHome();
    verifyHomeButtonWarningModal();
    clickDialogConfirm();
    verifyOnLandingPageNoProposalMsgIsVisible();
  });
});
