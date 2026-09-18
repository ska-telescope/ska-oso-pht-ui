import {
  createScienceIdeaSession,
  createStandardProposalSession,
  checkStatusIndicatorDisabled,
  verifyStatusIndicatorLabel,
  clearLocalStorage
} from '../common/common.js';
import { standardUser } from '../users/users.js';

describe('Verify navigation', () => {
  afterEach(() => {
    clearLocalStorage();
  });

  it('Science verification: Verify navigation is enabled and page banner has correct items after science idea creation', () => {
    createScienceIdeaSession(standardUser);
    //Verify navigation links are all enabled in page banner after SV creation
    checkStatusIndicatorDisabled('statusId0', false);
    checkStatusIndicatorDisabled('statusId1', false);
    checkStatusIndicatorDisabled('statusId2', false);
    checkStatusIndicatorDisabled('statusId3', false);
    checkStatusIndicatorDisabled('statusId4', false);
    checkStatusIndicatorDisabled('statusId5', false);
    // statusId6 unavailable for science verification
    checkStatusIndicatorDisabled('statusId7', false);
    // statusId8 unavailable for science verification
    checkStatusIndicatorDisabled('statusId9', false);
    // See SRCNet INACTIVE - checkStatusIndicatorDisabled('statusId10', false);

    //Verify navigation in page banner is correct after science idea creation
    verifyStatusIndicatorLabel('statusId0', 'Title');
    verifyStatusIndicatorLabel('statusId1', 'Team');
    verifyStatusIndicatorLabel('statusId2', 'Details');
    verifyStatusIndicatorLabel('statusId3', 'Description');
    verifyStatusIndicatorLabel('statusId4', 'Target');
    verifyStatusIndicatorLabel('statusId5', 'Observation');
    verifyStatusIndicatorLabel('statusId7', 'Data Product');
    verifyStatusIndicatorLabel('statusId9', 'Calibration');
  });

  // No standard/PI-proposal cycle exists in the real backend yet (only a Science Verification
  // one is seeded) - stub-only until one is, this isn't a test-code fix.
  //
  // Skipped via it.skip() (not this.skip()) - see reviewScience.test.js's comment: a
  // function(){...this.skip()} test sharing a spec with cy.intercept().as() elsewhere (here,
  // createScienceIdeaSession in the test above) reliably corrupts Cypress's command tracking.
  // it.skip() never invokes the callback at all, so it sidesteps that entirely.
  it.skip('Proposal: Verify page banner has correct items', () => {
    createStandardProposalSession(standardUser);
    //Verify navigation in page banner is correct after proposal creation
    verifyStatusIndicatorLabel('statusId0', 'Title');
    verifyStatusIndicatorLabel('statusId1', 'Team');
    verifyStatusIndicatorLabel('statusId2', 'General');
    verifyStatusIndicatorLabel('statusId3', 'Science');
    verifyStatusIndicatorLabel('statusId6', 'Technical');
    verifyStatusIndicatorLabel('statusId4', 'Target');
    verifyStatusIndicatorLabel('statusId5', 'Observation');
    verifyStatusIndicatorLabel('statusId7', 'Data Product');
    verifyStatusIndicatorLabel('statusId8', 'Linking');
    verifyStatusIndicatorLabel('statusId9', 'Calibration');
  });
});
