import {
  clearLocalStorage,
  checkFieldDisabled,
  checkFieldIsVisible,
  beginScienceIdeaSession,
  selectScienceVerificationCycle,
  completeScienceIdeaCreation
} from '../../common/common.js';
import { standardUser } from '../../users/users.js';

describe('Verify Save', () => {
  afterEach(() => {
    clearLocalStorage();
  });

  it('SV Flow: Verify save becomes available only after SV idea creation', () => {
    beginScienceIdeaSession(standardUser);
    selectScienceVerificationCycle();
    //Verify save is not visible before sv creation
    checkFieldIsVisible('saveBtn', false);
    completeScienceIdeaCreation();
    //Verify save is enabled after sv creation
    checkFieldDisabled('saveBtn', false);
  });

  it('Proposal Flow: Verify save becomes available only after proposal creation', function () {
    // No standard/PI-proposal cycle exists in the real backend yet (only a Science Verification
    // one is seeded) - stub-only until one is, this isn't a test-code fix.
    this.skip();
  });
});
