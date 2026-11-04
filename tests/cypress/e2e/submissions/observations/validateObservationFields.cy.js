import {
  checkAddTargetDisabled,
  clearLocalStorage,
  pageConfirmed,
  clickStatusIconNav,
  updateFieldValue,
  addM2TargetAndAutoLink,
  verifyOsdDataCycleID,
  verifyOsdDataCycleDescription,
  verifyOsdDataProposalOpen,
  verifyOsdDataProposalClose,
  beginScienceIdeaSession,
  selectScienceVerificationCycle,
  completeScienceIdeaCreation,
  pageStatus
} from '../../../support/common.js';
import { standardUser } from '../../../support/users.js';

describe('SV Flow: Validate Observation Fields', () => {
  beforeEach(() => {
    //Create autoLink submission
    beginScienceIdeaSession(standardUser);
    verifyOsdDataCycleID('TEST_SKAO_2027_1_ID');
    verifyOsdDataCycleDescription('TEST Low AA2 Science Verification');
    verifyOsdDataProposalOpen('2026-03-27T12:00:00.000Z');
    verifyOsdDataProposalClose('2027-04-01T15:00:00.000Z');
    selectScienceVerificationCycle();
    completeScienceIdeaCreation();
    addM2TargetAndAutoLink('Continuum');
    //verify addTarget is disabled after autoLink
    checkAddTargetDisabled(true);
  });

  afterEach(() => {
    clearLocalStorage();
  });

  it('SV Flow: Validate continuum bandwidth field', () => {
    clickStatusIconNav('Observation');
    pageConfirmed('OBSERVATION');
    updateFieldValue('Bandwidth', '500'); //update continuum bandwidth to an invalid value
    cy.contains('Maximum bandwidth for this array assembly (150.00 MHz) exceeded').should(
      'be.visible'
    );
  });

  it('SV Flow: Valid frequency shows OK in the observation breadcrumb', () => {
    clickStatusIconNav('Observation');
    pageConfirmed('OBSERVATION');
    // Default auto-linked observation: 200 MHz central frequency, 150 MHz bandwidth
    // Valid centre range for LOW (50–350 MHz band): [50+75, 350-75] = [125, 275] MHz
    pageStatus('Observation').should('have.attr', 'aria-label').and('include', 'OK');
  });

  it('SV Flow: Frequency bandwidth extending outside band edge shows Error in the observation breadcrumb', () => {
    clickStatusIconNav('Observation');
    pageConfirmed('OBSERVATION');
    // 110 MHz: lower edge = 110 - 75 = 35 MHz, below the 50 MHz band floor
    updateFieldValue('Central Frequency', '110');
    pageStatus('Observation').should('have.attr', 'aria-label').and('include', 'Error');
  });
});
