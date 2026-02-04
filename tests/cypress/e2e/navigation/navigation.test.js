import {
  initialize,
  clearLocalStorage,
  clickCycleConfirm,
  enterScienceVerificationIdeaTitle,
  clickAddSubmission,
  clickCreateSubmission,
  mockCreateSubmissionAPI,
  verifySubmissionCreatedAlertFooter,
  clickCycleSelectionSV,
  checkStatusIndicatorDisabled,
  verifyScienceIdeaCreatedAlertFooter,
  verifyStatusIndicatorLabel,
  clickCycleSelectionMockProposal,
  enterProposalTitle,
  clickProposalTypePrincipleInvestigator,
  clickSubProposalTypeTargetOfOpportunity
} from '../common/common.js';
import { standardUser } from '../users/users.js';

describe('Verify navigation', () => {
  beforeEach(() => {
    initialize(standardUser);
    mockCreateSubmissionAPI();
  });

  afterEach(() => {
    clearLocalStorage();
  });

  it('Science verification: Verify navigation functionality is not restricted after science idea creation', () => {
    clickAddSubmission();
    clickCycleSelectionSV();
    clickCycleConfirm();
    enterScienceVerificationIdeaTitle();
    clickCreateSubmission();
    cy.wait('@mockCreateSubmission');
    verifyScienceIdeaCreatedAlertFooter();
    //Verify navigation links are all enabled in page banner after proposal creation
    checkStatusIndicatorDisabled('statusId0', false);
    checkStatusIndicatorDisabled('statusId1', false);
    checkStatusIndicatorDisabled('statusId2', false);
    checkStatusIndicatorDisabled('statusId3', false);
    checkStatusIndicatorDisabled('statusId4', false);
    checkStatusIndicatorDisabled('statusId5', false);
    // statusId6 unavailable for science verification
    checkStatusIndicatorDisabled('statusId7', false);
    // statusId8 unavailable for science verification
    checkStatusIndicatorDisabled('statusId9', false);
    // See SRCNet INACTIVE - checkStatusIndicatorDisabled('statusId10', false);
  });

  it('Science verification: Verify page banner has correct items', () => {
    clickAddSubmission();
    clickCycleSelectionSV();
    clickCycleConfirm();
    enterScienceVerificationIdeaTitle();
    clickCreateSubmission();
    cy.wait('@mockCreateSubmission');
    verifyScienceIdeaCreatedAlertFooter();
    //Verify navigation links are all enabled in page banner after proposal creation
    verifyStatusIndicatorLabel('statusId0', 'Title');
    verifyStatusIndicatorLabel('statusId1', 'Team');
    verifyStatusIndicatorLabel('statusId2', 'Details');
    verifyStatusIndicatorLabel('statusId3', 'Description');
    verifyStatusIndicatorLabel('statusId4', 'Target');
    verifyStatusIndicatorLabel('statusId5', 'Observation');
    verifyStatusIndicatorLabel('statusId7', 'Data Product');
    verifyStatusIndicatorLabel('statusId9', 'Calibration');
  });

  it('Proposal: Verify page banner has correct items', () => {
    clickAddSubmission();
    clickCycleSelectionMockProposal();
    clickCycleConfirm();
    enterProposalTitle();
    clickProposalTypePrincipleInvestigator();
    clickSubProposalTypeTargetOfOpportunity();
    clickCreateSubmission();
    cy.wait('@mockCreateSubmission');
    verifySubmissionCreatedAlertFooter();
    //Verify navigation links are all enabled in page banner after proposal creation
    verifyStatusIndicatorLabel('statusId0', 'Title');
    verifyStatusIndicatorLabel('statusId1', 'Team');
    verifyStatusIndicatorLabel('statusId2', 'Details');
    verifyStatusIndicatorLabel('statusId3', 'Science');
    verifyStatusIndicatorLabel('statusId6', 'Technical');
    verifyStatusIndicatorLabel('statusId4', 'Target');
    verifyStatusIndicatorLabel('statusId5', 'Observation');
    verifyStatusIndicatorLabel('statusId7', 'Data Product');
    verifyStatusIndicatorLabel('statusId8', 'Linking');
    verifyStatusIndicatorLabel('statusId9', 'Calibration');
  });
});
