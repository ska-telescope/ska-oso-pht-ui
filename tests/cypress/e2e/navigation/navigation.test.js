import {
  clickAddProposal,
  mockCreateProposalAPI,
  initialize,
  clearLocalStorage,
  clickCycleConfirm
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

  it('Verify navigation via page banner is restricted before proposal creation', () => {
    clickAddProposal();
    clickCycleConfirm();
    //TODO: Verify Disabled navigation links in page banner before proposal creation
  });
});
