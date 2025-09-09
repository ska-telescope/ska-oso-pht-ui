import {
  clickAddProposal,
  clickCreateProposal,
  clickHome,
  clickProposalTypePrincipleInvestigator,
  clickSubProposalTypeTargetOfOpportunity,
  enterProposalTitle,
  verifyOnLandingPage,
  verifyOnLandingPageFilterIsVisible,
  verifyProposalCreatedAlertFooter,
  verifyMockedProposalOnLandingPageIsVisible,
  mockCreateProposalAPI,
  initialize
} from '../common/common';
import { defaultUser } from '../users/users.js';

describe('Creating Proposal', () => {
  beforeEach(() => {
    initialize(defaultUser);
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
