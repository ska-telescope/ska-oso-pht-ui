import {
  clickAddProposal,
  mockCreateProposalAPI,
  initialize,
  clearLocalStorage,
  clickCycleConfirm,
  checkStatusIndicatorDisabled,
  enterProposalTitle,
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

  it('Science verification: Verify navigation functionality is not restricted after proposal creation', () => {
    clickAddProposal();
    clickCycleConfirm();
    enterProposalTitle();
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
    // statusId7 unavailable for science verification
    checkStatusIndicatorDisabled('statusId8', false);
    checkStatusIndicatorDisabled('statusId9', false);
    checkStatusIndicatorDisabled('statusId10', false);
  });
});
