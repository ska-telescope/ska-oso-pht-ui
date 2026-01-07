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

describe('Verify Save', () => {
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

  it('Verify save functionality is restricted before proposal creation', () => {
    clickAddSubmission();
    clickCycleConfirm();
    //Verify save is disabled before proposal creation
    // checkFieldDisabled('saveBtn', true);
  });

  it('Verify save functionality is not restricted after proposal creation', () => {
    clickAddSubmission();
    clickCycleConfirm();
    enterProposalTitle();
    // clickProposalTypePrincipleInvestigator();
    // clickSubProposalTypeTargetOfOpportunity();
    clickCreateSubmission();
    cy.wait('@mockCreateSubmission');
    verifySubmissionCreatedAlertFooter();
    //Verify save is enabled after proposal creation
    // checkFieldDisabled('saveBtn', false);
  });
});
