import {
  clickAddProposal,
  mockCreateProposalAPI,
  initialize,
  clearLocalStorage,
  clickCycleConfirm,
  checkStatusIndicatorDisabled
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

  it('Verify navigation functionality is restricted before proposal creation', () => {
    clickAddProposal();
    clickCycleConfirm();
    //Verify Disabled navigation links in page banner before proposal creation
    checkStatusIndicatorDisabled('statusId0', false); //title page should remain enabled
    checkStatusIndicatorDisabled('statusId1', true);
    checkStatusIndicatorDisabled('statusId2', true);
    checkStatusIndicatorDisabled('statusId3', true);
    checkStatusIndicatorDisabled('statusId4', true);
    checkStatusIndicatorDisabled('statusId5', true);
    checkStatusIndicatorDisabled('statusId6', true);
    checkStatusIndicatorDisabled('statusId7', true);
    checkStatusIndicatorDisabled('statusId8', true);
    checkStatusIndicatorDisabled('statusId9', true);
  });
});
