import {
  clickHome,
  verifyOnLandingPage,
  verifyOnLandingPageFilterIsVisible,
  clearLocalStorage,
  verifyOsdDataCycleID,
  verifyOsdDataCycleDescription,
  verifyOsdDataProposalOpen,
  verifyOsdDataProposalClose,
  addM2TargetAndAutoLink,
  mockResolveTargetAPI,
  verifyMockedScienceIdeaOnLandingPageIsVisible,
  beginScienceIdeaSession,
  selectScienceVerificationCycle,
  completeScienceIdeaCreation
} from '../../common/common.js';
import { standardUser } from '../../users/users.js';

describe('Creating Proposal', () => {
  beforeEach(() => {
    mockResolveTargetAPI();
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

  // The PDF upload step below needs real AWS S3 credentials, sourced from Vault in a proper
  // deployment - our local minikube deploy of ska-oso-services runs with vault.enabled=false (see
  // its Makefile), which injects a dummy AWS key/secret instead, so any live upload fails. Skip
  // until that's addressed; this isn't a test-code fix.
  it(
    'SV Flow: Create science verification idea, Observing mode Continuum, verify sensitivity calculator results, validate and submit',
    { jiraKey: 'XTP-96352' },
    function () {
      this.skip();
    }
  );

  it(
    'SV Flow: Create science verification idea, Observing mode Spectral, verify sensitivity calculator results, validate and submit',
    { jiraKey: 'XTP-96345' },
    function () {
      this.skip();
    }
  );

  it(
    'SV Flow: Create science verification idea, Observing mode PST, verify sensitivity calculator results, validate and submit',
    { jiraKey: 'XTP-96353' },
    function () {
      this.skip();
    }
  );

  // No standard/PI-proposal cycle exists in the real backend yet (only a Science Verification one
  // is seeded) - stub-only until one is, this isn't a test-code fix.
  it('Proposal Flow: Create a basic proposal', { jiraKey: 'XTP-59739' }, function () {
    this.skip();
  });
});
