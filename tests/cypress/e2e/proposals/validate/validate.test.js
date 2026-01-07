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
  verifySubmissionCreatedAlertFooter
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

  it.skip('Verify validate functionality is restricted before proposal creation', () => {
    clickAddSubmission();
    clickCycleConfirm();
    //Verify validate is disabled before proposal creation
    // checkFieldDisabled('validateBtn', true);
  });

  it.skip('Verify validate functionality is not restricted after proposal creation', () => {
    clickAddSubmission();
    clickCycleConfirm();
    enterProposalTitle();
    // clickProposalTypePrincipleInvestigator();
    // clickSubProposalTypeTargetOfOpportunity();
    clickCreateSubmission();
    cy.wait('@mockCreateSubmission');
    verifySubmissionCreatedAlertFooter();
    //Verify validate is enabled after proposal creation
    checkFieldDisabled('validateBtn', false);
  });
});
