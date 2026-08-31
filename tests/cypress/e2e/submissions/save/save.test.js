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

  // No standard/PI-proposal cycle exists in the real backend yet (only a Science Verification
  // one is seeded) - stub-only until one is, this isn't a test-code fix.
  //
  // Skipped via it.skip() (not this.skip()) - see reviewScience.test.js's comment: a
  // function(){...this.skip()} test sharing a spec with cy.intercept().as() elsewhere (here,
  // beginScienceIdeaSession in the test above) reliably corrupts Cypress's command tracking.
  // it.skip() never invokes the callback at all, so it sidesteps that entirely.
  it.skip('Proposal Flow: Verify save becomes available only after proposal creation', () => {
    beginStandardProposalSession(standardUser);
    selectStandardProposalCycle();
    //Verify save is not visible before proposal creation
    checkFieldIsVisible('saveBtn', false);
    completeStandardProposalCreation();
    //Verify save is enabled after proposal creation
    checkFieldDisabled('saveBtn', false);
  });
});
