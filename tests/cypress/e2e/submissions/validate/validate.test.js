import {
  clearLocalStorage,
  checkFieldDisabled,
  checkFieldIsVisible,
  beginScienceIdeaSession,
  selectScienceVerificationCycle,
  completeScienceIdeaCreation,
  beginStandardProposalSession,
  selectStandardProposalCycle,
  completeStandardProposalCreation
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

  // No standard/PI-proposal cycle exists in the real backend yet (only a Science Verification
  // one is seeded) - stub-only until one is, this isn't a test-code fix.
  //
  // Skipped via it.skip() (not this.skip()) - see reviewScience.test.js's comment: a
  // function(){...this.skip()} test sharing a spec with cy.intercept().as() elsewhere (here,
  // beginScienceIdeaSession in the test above) reliably corrupts Cypress's command tracking.
  // it.skip() never invokes the callback at all, so it sidesteps that entirely.
  it.skip('Proposal Flow: Verify validate becomes available only after proposal creation', () => {
    beginStandardProposalSession(standardUser);
    selectStandardProposalCycle();
    //Verify validate is not visible before proposal creation
    checkFieldIsVisible('validateBtn', false);
    completeStandardProposalCreation();
    //Verify validate / submit is enabled after proposal creation
    checkFieldDisabled('validateBtn', false);
  });
});
