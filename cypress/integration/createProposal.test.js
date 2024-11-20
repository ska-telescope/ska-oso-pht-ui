import {
  clickAddProposal,
  clickCreateProposal,
  clickHome,
  clickStandardProposalSubTypeTargetOfOpportunity,
  enterProposalTitle,
  verifyFirstProposalOnLandingPageIsVisible,
  verifyOnLandingPage,
  verifyOnLandingPageFilterIsVisible,
  verifyProposalCreatedAlertFooter
} from './common/common';

describe('Creating Proposal', () => {
  it('Create a basic proposal', { jiraKey: 'XTP-59739' }, () => {
    clickAddProposal();
    enterProposalTitle();
    clickStandardProposalSubTypeTargetOfOpportunity();
    clickCreateProposal();
    verifyProposalCreatedAlertFooter();
    clickHome();
    verifyOnLandingPage();
    verifyOnLandingPageFilterIsVisible();
    verifyFirstProposalOnLandingPageIsVisible();
  });
});
