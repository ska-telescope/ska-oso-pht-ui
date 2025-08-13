import {
  clickAddProposal,
  clickCreateProposal,
  clickHome,
  clickProposalTypePrincipleInvestigator,
  clickSubProposalTypeTargetOfOpportunity,
  initialize,
  enterProposalTitle,
  verifyFirstProposalOnLandingPageIsVisible,
  verifyOnLandingPage,
  verifyOnLandingPageFilterIsVisible,
  verifyProposalCreatedAlertFooter,
  clickLoginUser
} from '../common/common';

describe('Creating Proposal', () => {
  beforeEach(() => {
    initialize();
    cy.mockLoginButton();
  });
  it('Create a basic proposal', { jiraKey: 'XTP-59739' }, () => {
    clickLoginUser();

    clickAddProposal();
    enterProposalTitle();
    clickProposalTypePrincipleInvestigator();
    clickSubProposalTypeTargetOfOpportunity();
    clickCreateProposal();
    verifyProposalCreatedAlertFooter();
    clickHome();
    verifyOnLandingPage();
    verifyOnLandingPageFilterIsVisible();
    verifyFirstProposalOnLandingPageIsVisible();
  });
});
