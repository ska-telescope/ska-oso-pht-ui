import {
  clickAddProposal,
  clickCreateProposal,
  clickHome,
  // clickProposalTypePrincipleInvestigator,
  // clickSubProposalTypeTargetOfOpportunity,
  enterProposalTitle,
  verifyOnLandingPage,
  verifyOnLandingPageFilterIsVisible,
  verifyProposalCreatedAlertFooter,
  verifyMockedProposalOnLandingPageIsVisible,
  mockCreateProposalAPI,
  initialize,
  clearLocalStorage,
  clickCycleConfirm
} from '../../common/common.js';
import { standardUser } from '../../users/users.js';

describe('Creating Proposal', () => {
  beforeEach(() => {
    initialize(standardUser);
    mockCreateProposalAPI();
  });

  afterEach(() => {
    clearLocalStorage();
  });

  it('Create a basic proposal', { jiraKey: 'XTP-59739' }, () => {
    clickAddProposal();
    clickCycleConfirm();
    enterProposalTitle();
    // clickProposalTypePrincipleInvestigator();
    // clickSubProposalTypeTargetOfOpportunity();
    clickCreateProposal();
    cy.wait('@mockCreateProposal');
    verifyProposalCreatedAlertFooter();
    clickHome();
    verifyOnLandingPage();
    // verifyOnLandingPageFilterIsVisible();
    verifyMockedProposalOnLandingPageIsVisible();
  });
});
