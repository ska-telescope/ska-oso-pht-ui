import {
  clickHome,
  // clickProposalTypePrincipleInvestigator,
  // clickSubProposalTypeTargetOfOpportunity,
  enterProposalTitle,
  verifyOnLandingPage,
  verifyOnLandingPageFilterIsVisible,
  verifyMockedProposalOnLandingPageIsVisible,
  initialize,
  clearLocalStorage,
  clickCycleConfirm,
  clickAddSubmission,
  clickCreateSubmission,
  mockCreateSubmissionAPI,
  verifySubmissionCreatedAlertFooter,
  clickCycleSelection,
  enterScienceVerificationIdeaTitle
} from '../../common/common.js';
import { standardUser } from '../../users/users.js';

describe('Creating Proposal', () => {
  beforeEach(() => {
    initialize(standardUser);
    mockCreateSubmissionAPI();
  });

  afterEach(() => {
    clearLocalStorage();
  });

  it('Create a basic science verification idea', () => {
    clickAddSubmission();
    clickCycleSelection();
    clickCycleConfirm();
    enterScienceVerificationIdeaTitle();
    clickCreateSubmission();
    cy.wait('@mockCreateSubmission');
    verifySubmissionCreatedAlertFooter();
    clickHome();
    verifyOnLandingPage();
    // verifyOnLandingPageFilterIsVisible();
    verifyMockedProposalOnLandingPageIsVisible();
  });

  it.skip('Create a basic proposal', { jiraKey: 'XTP-59739' }, () => {
    clickAddSubmission();
    clickCycleConfirm();
    enterProposalTitle();
    // clickProposalTypePrincipleInvestigator();
    // clickSubProposalTypeTargetOfOpportunity();
    clickCreateSubmission();
    cy.wait('@mockCreateSubmission');
    verifySubmissionCreatedAlertFooter();
    clickHome();
    verifyOnLandingPage();
    // verifyOnLandingPageFilterIsVisible();
    verifyMockedProposalOnLandingPageIsVisible();
  });
});
