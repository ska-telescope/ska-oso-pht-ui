import {
  initialize,
  clearLocalStorage,
  clickCycleConfirm,
  enterProposalTitle,
  // clickProposalTypePrincipleInvestigator,
  // clickSubProposalTypeTargetOfOpportunity,
  checkFieldDisabled,
  clickAddSubmission,
  clickCreateSubmission,
  verifySubmissionCreatedAlertFooter,
  clickCycleSelectionSV,
  checkFieldIsVisible,
  clickCycleSelectionMockProposal,
  clickProposalTypePrincipleInvestigator,
  clickSubProposalTypeTargetOfOpportunity,
  enterScienceVerificationIdeaTitle,
  verifyScienceIdeaCreatedAlertFooter,
  mockCreateSVIdeaAPI,
  mockCreateProposalAPI
} from '../../common/common.js';
import { standardUser } from '../../users/users.js';

describe('Verify validate', () => {
  beforeEach(() => {
    initialize(standardUser);
    mockCreateSVIdeaAPI();
    mockCreateProposalAPI();
  });

  afterEach(() => {
    clearLocalStorage();
  });

  it('SV Flow: Verify validate functionality is restricted before sv creation', () => {
    clickAddSubmission();
    clickCycleSelectionSV();
    clickCycleConfirm();
    //Verify validate / submit is not visible before sv creation
    checkFieldIsVisible('submitBtnTestId', false);
  });

  it('SV Flow: Verify validate functionality is not restricted after sv creation', () => {
    clickAddSubmission();
    clickCycleSelectionSV();
    clickCycleConfirm();
    enterScienceVerificationIdeaTitle();
    clickCreateSubmission();
    cy.wait('@mockCreateSVIdea');
    verifyScienceIdeaCreatedAlertFooter();
    //Verify validate / submit is enabled after sv creation
    checkFieldDisabled('submitBtnTestId', false);
  });

  it('Proposal Flow: Verify validate functionality is restricted before proposal creation', () => {
    clickAddSubmission();
    clickCycleSelectionMockProposal();
    clickCycleConfirm();
    //Verify validate is not visible before proposal creation
    checkFieldIsVisible('validateBtn', false);
  });

  it('Proposal Flow: Verify validate functionality is not restricted after proposal creation', () => {
    clickAddSubmission();
    clickCycleSelectionMockProposal();
    clickCycleConfirm();
    enterProposalTitle();
    clickProposalTypePrincipleInvestigator();
    clickSubProposalTypeTargetOfOpportunity();
    clickCreateSubmission();
    cy.wait('@mockCreateProposal');
    verifySubmissionCreatedAlertFooter();
    //Verify validate / submit is enabled after proposal creation
    checkFieldDisabled('validateBtn', false);
  });
});
