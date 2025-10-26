import {
  clickAddProposal,
  mockCreateProposalAPI,
  initialize,
  clearLocalStorage,
  clickCycleConfirm,
  enterProposalTitle,
  clickProposalTypePrincipleInvestigator,
  clickSubProposalTypeTargetOfOpportunity,
  clickCreateProposal,
  verifyProposalCreatedAlertFooter,
  checkFieldDisabled
} from '../../common/common.js';
import { standardUser } from '../../users/users.js';

describe('Verify Save', () => {
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

  it('Verify save functionality is restricted before proposal creation', () => {
    clickAddProposal();
    clickCycleConfirm();
    //Verify save is disabled before proposal creation
    checkFieldDisabled('saveBtn', true);
  });

  it('Verify save functionality is not restricted after proposal creation', () => {
    clickAddProposal();
    clickCycleConfirm();
    enterProposalTitle();
    clickProposalTypePrincipleInvestigator();
    clickSubProposalTypeTargetOfOpportunity();
    clickCreateProposal();
    cy.wait('@mockCreateProposal');
    verifyProposalCreatedAlertFooter();
    //Verify save is enabled after proposal creation
    checkFieldDisabled('saveBtn', false);
  });
});
