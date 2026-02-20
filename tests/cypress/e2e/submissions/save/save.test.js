import {
  initialize,
  clearLocalStorage,
  clickCycleConfirm,
  enterProposalTitle,
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

describe('Verify Save', () => {
  beforeEach(() => {
    initialize(standardUser);
    mockCreateSVIdeaAPI();
    mockCreateProposalAPI();
  });

  afterEach(() => {
    clearLocalStorage();
  });

  it('SV Flow: Verify save functionality is restricted before sv creation', () => {
    clickAddSubmission();
    clickCycleSelectionSV();
    clickCycleConfirm();
    //Verify save is not visible before sv creation
    checkFieldIsVisible('saveBtn', false);
  });

  it('SV Flow: Verify save functionality is not restricted after sv creation', () => {
    clickAddSubmission();
    clickCycleSelectionSV();
    clickCycleConfirm();
    enterScienceVerificationIdeaTitle();
    clickCreateSubmission();
    cy.wait('@mockCreateSVIdea');
    verifyScienceIdeaCreatedAlertFooter();
    //Verify save is enabled after sv creation
    checkFieldDisabled('saveBtn', false);
  });

  it('Proposal Flow: Verify save functionality is restricted before proposal creation', () => {
    clickAddSubmission();
    clickCycleSelectionMockProposal();
    clickCycleConfirm();
    //Verify save is not visible before proposal creation
    checkFieldIsVisible('saveBtn', false);
  });

  it('Proposal Flow: Verify save functionality is not restricted after proposal creation', () => {
    clickAddSubmission();
    clickCycleSelectionMockProposal();
    clickCycleConfirm();
    enterProposalTitle();
    clickProposalTypePrincipleInvestigator();
    clickSubProposalTypeTargetOfOpportunity();
    clickCreateSubmission();
    cy.wait('@mockCreateProposal');
    verifySubmissionCreatedAlertFooter();
    //Verify save is enabled after proposal creation
    checkFieldDisabled('saveBtn', false);
  });
});
