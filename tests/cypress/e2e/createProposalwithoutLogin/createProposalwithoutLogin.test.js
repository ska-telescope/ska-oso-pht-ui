import {
  checkFieldDisabled,
  clickAddProposal,
  clickCreateProposal,
  clickHome,
  clickHomeWarningConfirmation,
  clickProposalTypePrincipleInvestigator,
  clickSubProposalTypeTargetOfOpportunity,
  enterProposalTitle,
  verifyOnLandingPageNoProposalMsgIsVisible,
  verifyProposalCreatedAlertFooter,
  verifyHomeButtonWarningModal,
  initialize
} from '../common/common';
import { defaultUser } from '../users/users.js';

describe('Creating Proposal without login', () => {
  beforeEach(() => {
    initialize(defaultUser);
    cy.window().then(win => {
      win.localStorage.setItem('proposal:noLogin', 'true');
    });
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
    clickHomeWarningConfirmation();
    verifyOnLandingPageNoProposalMsgIsVisible();
  });
});
