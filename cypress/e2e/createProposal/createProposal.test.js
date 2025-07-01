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
  verifyProposalCreatedAlertFooter
} from '../common/common';

describe('XTP-59739 Create Proposal', () => {
  beforeEach(() => {
    initialize();
  });
  it('Create a basic proposal', () => {
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
