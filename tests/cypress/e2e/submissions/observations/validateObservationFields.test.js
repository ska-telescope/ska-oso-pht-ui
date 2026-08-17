import {
  clearLocalStorage,
  pageConfirmed,
  clickStatusIconNav,
  updateFieldValue,
  checkFieldDisabled,
  mockResolveTargetAPI,
  addM2TargetAndAutoLink,
  verifyOsdDataCycleID,
  verifyOsdDataCycleDescription,
  verifyOsdDataProposalOpen,
  verifyOsdDataProposalClose,
  beginScienceIdeaSession,
  selectScienceVerificationCycle,
  completeScienceIdeaCreation,
  isLiveMode
} from '../../common/common.js';
import { standardUser } from '../../users/users.js';

describe('SV Flow: Validate Observation Fields', () => {
  beforeEach(() => {
    mockResolveTargetAPI();

    //Create autoLink submission
    beginScienceIdeaSession(standardUser);
    // The expected values necessarily differ between modes - the stub fixture's SV cycle isn't
    // the same cycle a real backend has actually seeded (see clickCycleSelectionSV's comment).
    if (isLiveMode()) {
      verifyOsdDataCycleID('TEST_SKAO_2027_1_ID');
      verifyOsdDataCycleDescription('TEST Low AA2 Science Verification');
      verifyOsdDataProposalOpen('2026-03-27T12:00:00.000Z');
      verifyOsdDataProposalClose('2027-04-01T15:00:00.000Z');
    } else {
      verifyOsdDataCycleID('SKAO_2027_1_ID');
      verifyOsdDataCycleDescription('Low AA2 Science Verification'); //verify OSD data
      verifyOsdDataProposalOpen('20260327T12:00:00.000Z'); //verify OSD data
      verifyOsdDataProposalClose('20260512T15:00:00.000Z'); //verify OSD data
    }
    selectScienceVerificationCycle();
    completeScienceIdeaCreation();
    addM2TargetAndAutoLink('Continuum');
    //verify addTarget is disabled after autoLink
    checkFieldDisabled('addTargetButton', true);
  });

  afterEach(() => {
    clearLocalStorage();
  });

  it('SV Flow: Validate continuum bandwidth field', () => {
    clickStatusIconNav('statusId5'); //Click to observation page
    pageConfirmed('OBSERVATION');
    updateFieldValue('continuumBandwidth', '500'); //update continuum bandwidth to an invalid value
    // continuumBandwidth's testid is on the input itself, and its FormHelperText is a sibling
    // of the input's own parent (not reachable via verifyFieldError's single .parent() hop), so
    // it carries its own dedicated testid instead.
    cy.get('[data-testid="continuumBandwidthError"]').should(
      'contain.text',
      'Maximum bandwidth for this array assembly (150.00 MHz) exceeded'
    );
  });

  it('SV Flow: Valid frequency shows OK in the observation breadcrumb', () => {
    clickStatusIconNav('statusId5');
    pageConfirmed('OBSERVATION');
    // Default auto-linked observation: 200 MHz central frequency, 150 MHz bandwidth
    // Valid centre range for LOW (50–350 MHz band): [50+75, 350-75] = [125, 275] MHz
    cy.get('[data-testid="statusId5"]').should('have.attr', 'aria-label').and('include', 'OK');
  });

  it('SV Flow: Frequency bandwidth extending outside band edge shows Error in the observation breadcrumb', () => {
    clickStatusIconNav('statusId5');
    pageConfirmed('OBSERVATION');
    // 110 MHz: lower edge = 110 - 75 = 35 MHz, below the 50 MHz band floor
    updateFieldValue('centralFrequency', '110');
    cy.get('[data-testid="statusId5"]').should('have.attr', 'aria-label').and('include', 'Error');
  });
});
