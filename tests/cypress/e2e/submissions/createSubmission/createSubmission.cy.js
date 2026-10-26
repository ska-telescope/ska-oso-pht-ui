import {
  clickHome,
  verifyOnLandingPage,
  verifyOnLandingPageFilterIsVisible,
  verifyMockedProposalOnLandingPageIsVisible,
  clearLocalStorage,
  verifyOsdDataCycleID,
  verifyOsdDataCycleDescription,
  verifyOsdDataProposalOpen,
  verifyOsdDataProposalClose,
  addM2TargetAndAutoLink,
  spyOnResolveTargetAPI,
  verifyMockedScienceIdeaOnLandingPageIsVisible,
  beginScienceIdeaSession,
  selectScienceVerificationCycle,
  completeScienceIdeaCreation,
  createStandardProposalSession
} from '../../../support/common.js';
import { standardUser } from '../../../support/users.js';

describe('Creating Proposal', () => {
  beforeEach(() => {
    spyOnResolveTargetAPI();
  });

  afterEach(() => {
    clearLocalStorage();
  });

  it('SV Flow: Create a basic science verification idea, verify AutoLink', () => {
    // This is the one flow that needs to assert on the raw OSD content mid-creation, so it uses
    // the finer-grained pieces instead of createScienceIdeaSession.
    beginScienceIdeaSession(standardUser);
    verifyOsdDataCycleID('TEST_SKAO_2027_1_ID');
    verifyOsdDataCycleDescription('TEST Low AA2 Science Verification');
    verifyOsdDataProposalOpen('2026-03-27T12:00:00.000Z');
    verifyOsdDataProposalClose('2027-04-01T15:00:00.000Z');
    selectScienceVerificationCycle();
    completeScienceIdeaCreation();
    addM2TargetAndAutoLink('Continuum');
    clickHome();
    verifyOnLandingPage();
    verifyOnLandingPageFilterIsVisible();
    verifyMockedScienceIdeaOnLandingPageIsVisible();
  });

  // No standard/PI-proposal cycle exists in the real backend yet (only a Science Verification one
  // is seeded) - stub-only until one is, this isn't a test-code fix.
  //
  // Skipped via it.skip() (not this.skip()) - see reviewScience.cy.js's comment: a
  // function(){...this.skip()} test sharing a spec with cy.intercept().as() elsewhere (here, the
  // SV Flow test above and spyOnResolveTargetAPI in this describe's beforeEach) reliably corrupts
  // Cypress's command tracking. it.skip() never invokes the callback at all, so it sidesteps that
  // entirely.
  it.skip('Proposal Flow: Create a basic proposal', { jiraKey: 'XTP-59739' }, () => {
    createStandardProposalSession(standardUser);
    clickHome();
    verifyOnLandingPage();
    verifyOnLandingPageFilterIsVisible();
    verifyMockedProposalOnLandingPageIsVisible();
  });
});
