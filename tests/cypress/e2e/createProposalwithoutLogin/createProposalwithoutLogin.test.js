import {
  checkFieldDisabled,
  clickAddProposal,
  clickCreateProposal,
  clickHome,
  clickHomeWarningConfirmation,
  clickMockLoginButton,
  clickProposalTypePrincipleInvestigator,
  clickSubProposalTypeTargetOfOpportunity,
  initialize,
  enterProposalTitle,
  verifyOnLandingPageNoProposalMsgIsVisible,
  verifyProposalCreatedAlertFooter,
  verifyHomeButtonWarningModal
} from '../common/common';

describe('Creating Proposal without login', () => {
  beforeEach(() => {
    initialize();
  });
  it('Create a basic proposal without login', () => {
    cy.wait(500);
    clickMockLoginButton();
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
    clickHomeWarningConfirmation();
    verifyOnLandingPageNoProposalMsgIsVisible();
  });
});
