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
  enterScienceVerificationIdeaTitle,
  verifyProposalOpen,
  verifyCycleID,
  verifyProposalClose,
  clickCycleSelectionSV,
  clickCycleSelectionMockProposal,
  clickProposalTypePrincipleInvestigator,
  clickSubProposalTypeTargetOfOpportunity
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

  it('SV Flow: Create a basic science verification idea', () => {
    clickAddSubmission();
    verifyCycleID(); //verify OSD data
    verifyProposalOpen(); //verify OSD data
    verifyProposalClose(); //verify OSD data
    clickCycleSelectionSV();
    clickCycleConfirm();
    enterScienceVerificationIdeaTitle();
    clickCreateSubmission();
    cy.wait('@mockCreateSubmission');
    verifySubmissionCreatedAlertFooter();
    clickHome();
    verifyOnLandingPage();
    verifyOnLandingPageFilterIsVisible();
    verifyMockedProposalOnLandingPageIsVisible();
  });

  it('Proposal Flow: Create a basic proposal', { jiraKey: 'XTP-59739' }, () => {
    clickAddSubmission();
    clickCycleSelectionMockProposal();
    clickCycleConfirm();
    enterProposalTitle();
    clickProposalTypePrincipleInvestigator();
    clickSubProposalTypeTargetOfOpportunity();
    clickCreateSubmission();
    cy.wait('@mockCreateSubmission');
    verifySubmissionCreatedAlertFooter();
    clickHome();
    verifyOnLandingPage();
    verifyOnLandingPageFilterIsVisible();
    verifyMockedProposalOnLandingPageIsVisible();
  });
});
