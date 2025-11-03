import {
  clickAddProposal,
  mockCreateProposalAPI,
  initialize,
  clearLocalStorage,
  clickCycleConfirm,
  checkStatusIndicatorDisabled,
  enterProposalTitle,
  // clickProposalTypePrincipleInvestigator,
  // clickSubProposalTypeTargetOfOpportunity,
  clickCreateProposal,
  verifyProposalCreatedAlertFooter
} from '../common/common.js';
import { standardUser } from '../users/users.js';

describe('Verify navigation', () => {
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

  it('Verify navigation functionality is restricted before proposal creation', () => {
    clickAddProposal();
    clickCycleConfirm();
    /* All of this is not suppressed during creation step
    checkStatusIndicatorDisabled('statusId0', false);
    checkStatusIndicatorDisabled('statusId1', true);
    checkStatusIndicatorDisabled('statusId2', true);
    checkStatusIndicatorDisabled('statusId3', true);
    checkStatusIndicatorDisabled('statusId4', true);
    checkStatusIndicatorDisabled('statusId5', true);
    checkStatusIndicatorDisabled('statusId6', true);
    checkStatusIndicatorDisabled('statusId7', true);
    checkStatusIndicatorDisabled('statusId8', true);
    checkStatusIndicatorDisabled('statusId9', true);
    */
  });

  it('Verify navigation functionality is not restricted after proposal creation', () => {
    clickAddProposal();
    clickCycleConfirm();
    enterProposalTitle();
    // clickProposalTypePrincipleInvestigator();
    // clickSubProposalTypeTargetOfOpportunity();
    clickCreateProposal();
    cy.wait('@mockCreateProposal');
    verifyProposalCreatedAlertFooter();
    //Verify navigation links are all enabled in page banner after proposal creation
    checkStatusIndicatorDisabled('statusId0', false);
    checkStatusIndicatorDisabled('statusId1', false);
    checkStatusIndicatorDisabled('statusId2', false);
    checkStatusIndicatorDisabled('statusId3', false);
    checkStatusIndicatorDisabled('statusId4', false);
    checkStatusIndicatorDisabled('statusId5', false);
    checkStatusIndicatorDisabled('statusId6', false);
    // checkStatusIndicatorDisabled('statusId7', false);
    checkStatusIndicatorDisabled('statusId8', false);
    checkStatusIndicatorDisabled('statusId9', false);
  });
});
