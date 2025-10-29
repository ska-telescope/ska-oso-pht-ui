import {
  clickAddProposal,
  mockCreateProposalAPI,
  initialize,
  clearLocalStorage,
  clickCycleConfirm,
  enterProposalTitle,
  // clickProposalTypePrincipleInvestigator,
  // clickSubProposalTypeTargetOfOpportunity,
  clickCreateProposal,
  verifyProposalCreatedAlertFooter,
  checkFieldDisabled
} from '../../common/common.js';
import { standardUser } from '../../users/users.js';

describe('Verify validate', () => {
  beforeEach(() => {
    initialize(standardUser);
    mockCreateProposalAPI();
  });

  afterEach(() => {
    clearLocalStorage();
  });

  before(() => {
    cy.window().then(win => {
      win.localStorage.setItem('cypress:proposalCreated', 'true');
    });
  });

  it('Verify validate functionality is restricted before proposal creation', () => {
    clickAddProposal();
    clickCycleConfirm();
    //Verify validate is disabled before proposal creation
    // checkFieldDisabled('validateBtn', true);
  });

  it('Verify validate functionality is not restricted after proposal creation', () => {
    clickAddProposal();
    clickCycleConfirm();
    enterProposalTitle();
    // clickProposalTypePrincipleInvestigator();
    // clickSubProposalTypeTargetOfOpportunity();
    clickCreateProposal();
    cy.wait('@mockCreateProposal');
    verifyProposalCreatedAlertFooter();
    //Verify validate is enabled after proposal creation
    checkFieldDisabled('validateBtn', false);
  });
});
