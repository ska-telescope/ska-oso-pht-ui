import {
  initialize,
  clearLocalStorage,
  clickCycleConfirm,
  enterProposalTitle,
  checkFieldDisabled,
  clickAddSubmission,
  clickCreateSubmission,
  mockCreateSubmissionAPI,
  verifySubmissionCreatedAlertFooter,
  clickCycleSelectionSV,
  checkFieldIsVisible,
  clickCycleSelectionMockProposal,
  clickProposalTypePrincipleInvestigator,
  clickSubProposalTypeTargetOfOpportunity
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

  it('SV Flow: Verify save functionality is restricted before sv creation', () => {
    clickAddSubmission();
    clickCycleSelectionSV();
    clickCycleConfirm();
    //Verify save is not visible before sv creation
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
    cy.wait('@mockCreateSubmission');
    verifySubmissionCreatedAlertFooter();
    //Verify save is enabled after proposal creation
    checkFieldDisabled('saveBtn', false);
  });
});
