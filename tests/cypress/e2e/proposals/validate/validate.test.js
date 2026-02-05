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
  mockCreateSubmissionAPI,
  verifySubmissionCreatedAlertFooter,
  createScienceIdeaLoggedIn,
  clickCycleSelectionSV,
  checkFieldIsVisible,
  clickCycleSelectionMockProposal,
  clickProposalTypePrincipleInvestigator,
  clickSubProposalTypeTargetOfOpportunity,
  enterScienceVerificationIdeaTitle,
  verifyScienceIdeaCreatedAlertFooter
} from '../../common/common.js';
import { standardUser } from '../../users/users.js';

describe('Verify validate', () => {
  beforeEach(() => {
    initialize(standardUser);
    mockCreateSubmissionAPI();
  });

  afterEach(() => {
    clearLocalStorage();
  });

  before(() => {
    cy.window().then(win => {
      win.localStorage.setItem('cypress:proposalCreated', 'true');
    });
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
    cy.wait('@mockCreateSubmission');
    verifyScienceIdeaCreatedAlertFooter();
    //Verify validate / submit is enabled after sv creation
    checkFieldDisabled('submitBtnTestId ', false);
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
    cy.wait('@mockCreateSubmission');
    verifySubmissionCreatedAlertFooter();
    //Verify validate / submit is enabled after proposal creation
    checkFieldDisabled('validateBtn', false);
  });
});
