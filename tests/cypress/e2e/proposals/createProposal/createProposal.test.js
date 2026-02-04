import {
  clickHome,
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
  clickCycleSelectionSV,
  clickCycleSelectionMockProposal,
  clickProposalTypePrincipleInvestigator,
  clickSubProposalTypeTargetOfOpportunity,
  mockOSDAPI,
  verifyOsdDataCycleID,
  verifyOsdDataCycleDescription,
  verifyOsdDataProposalOpen,
  verifyOsdDataProposalClose,
  pageConfirmed,
  verifyScienceIdeaCreatedAlertFooter
} from '../../common/common.js';
import { standardUser } from '../../users/users.js';

describe('Creating Proposal', () => {
  beforeEach(() => {
    initialize(standardUser);
    mockCreateSubmissionAPI();
    mockOSDAPI();
  });

  afterEach(() => {
    clearLocalStorage();
  });

  it('SV Flow: Create a basic science verification idea', () => {
    clickAddSubmission();
    cy.wait('@mockOSDData');
    verifyOsdDataCycleID('SKAO_2027_1');
    verifyOsdDataCycleDescription('Low AA2 Science Verification'); //verify OSD data
    verifyOsdDataProposalOpen('20260327T12:00:00.000Z'); //verify OSD data
    verifyOsdDataProposalClose('20260512T15:00:00.000Z'); //verify OSD data
    clickCycleSelectionSV();
    clickCycleConfirm();
    enterScienceVerificationIdeaTitle();
    clickCreateSubmission();
    cy.wait('@mockCreateSubmission');
    verifyScienceIdeaCreatedAlertFooter();
    pageConfirmed('TEAM');
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
    pageConfirmed('TEAM');
    clickHome();
    verifyOnLandingPage();
    verifyOnLandingPageFilterIsVisible();
    verifyMockedProposalOnLandingPageIsVisible();
  });
});
