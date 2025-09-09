import {
  clickAddProposal,
  clickCreateProposal,
  clickHome,
  clickProposalTypePrincipleInvestigator,
  clickSubProposalTypeTargetOfOpportunity,
  initializeAsDefaultUser,
  enterProposalTitle,
  verifyOnLandingPage,
  verifyOnLandingPageFilterIsVisible,
  verifyProposalCreatedAlertFooter,
  clickLoginUser,
  verifyMockedProposalOnLandingPageIsVisible,
  mockCreateProposalAPI
} from '../common/common';
import { defaultUser, reviewerChairman } from '../users/users.js';

describe('Creating Proposal', () => {
  beforeEach(() => {
    initializeAsDefaultUser();
    mockCreateProposalAPI();
  });
  it('Create a basic proposal', { jiraKey: 'XTP-59739' }, () => {
    clickAddProposal();
    enterProposalTitle();
    clickProposalTypePrincipleInvestigator();
    clickSubProposalTypeTargetOfOpportunity();
    clickCreateProposal();
    cy.wait('@mockCreateProposal');
    verifyProposalCreatedAlertFooter();
    clickHome();
    verifyOnLandingPage();
    verifyOnLandingPageFilterIsVisible();
    verifyMockedProposalOnLandingPageIsVisible();
  });
});
