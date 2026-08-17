import {
  clearLocalStorage,
  checkFieldDisabled,
  checkFieldIsVisible,
  beginScienceIdeaSession,
  selectScienceVerificationCycle,
  completeScienceIdeaCreation,
  beginStandardProposalSession,
  selectStandardProposalCycle,
  completeStandardProposalCreation,
  isLiveMode
} from '../../common/common.js';
import { standardUser } from '../../users/users.js';

describe('Verify validate', () => {
  afterEach(() => {
    clearLocalStorage();
  });

  it('SV Flow: Verify validate/submit becomes available only after SV idea creation', () => {
    beginScienceIdeaSession(standardUser);
    selectScienceVerificationCycle();
    //Verify validate / submit is not visible before sv creation
    checkFieldIsVisible('submitBtnTestId', false);
    completeScienceIdeaCreation();
    //Verify validate / submit is enabled after sv creation
    checkFieldDisabled('submitBtnTestId', false);
  });

  it('Proposal Flow: Verify validate becomes available only after proposal creation', function () {
    // No standard/PI-proposal cycle exists in the real backend yet (only a Science Verification
    // one is seeded) - stub-only until one is, this isn't a test-code fix.
    if (isLiveMode()) {
      this.skip();
    }
    beginStandardProposalSession(standardUser);
    selectStandardProposalCycle();
    //Verify validate is not visible before proposal creation
    checkFieldIsVisible('validateBtn', false);
    completeStandardProposalCreation();
    //Verify validate / submit is enabled after proposal creation
    checkFieldDisabled('validateBtn', false);
  });
});
