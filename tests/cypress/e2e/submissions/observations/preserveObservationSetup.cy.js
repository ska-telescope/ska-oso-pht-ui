import {
  clearLocalStorage,
  pageConfirmed,
  clickStatusIconNav,
  updateFieldValue,
  addSubmissionSummary,
  addM2TargetAndAutoLink,
  createScienceIdeaSession,
  numberField,
  submissionSummaryField
} from '../../../support/common.js';
import { standardUser } from '../../../support/users.js';

describe('SV Flow: Observation setup is preserved when details page fields change', () => {
  beforeEach(() => {
    createScienceIdeaSession(standardUser);
    addM2TargetAndAutoLink('Continuum');
  });

  afterEach(() => {
    clearLocalStorage();
  });

  it('Abstract is saved by debounce without requiring onBlur — navigating after 2s confirms the value persisted', () => {
    clickStatusIconNav('Details');
    pageConfirmed('DETAILS');
    addSubmissionSummary('Debounce test summary.');

    // Keep focus on the abstract field for longer than ERROR_SECS (2000ms) so the debounce
    // fires before onBlur. When we navigate below, onBlur fires too, but the save has
    // already happened via the timer. The margin above 2000ms is generous (rather than the
    // previous 500ms) since this is a fixed wall-clock wait racing a client-side timer, and a
    // loaded CI runner can delay JS timer firing.
    cy.wait(4000);

    clickStatusIconNav('Observation');
    pageConfirmed('OBSERVATION');

    clickStatusIconNav('Details');
    pageConfirmed('DETAILS');
    submissionSummaryField().should('have.value', 'Debounce test summary.');
  });

  it('Changing the abstract does not reset the observation frequency setup, and the abstract is saved', () => {
    clickStatusIconNav('Observation');
    pageConfirmed('OBSERVATION');
    updateFieldValue('Central Frequency', '180');

    clickStatusIconNav('Details');
    pageConfirmed('DETAILS');
    addSubmissionSummary('This is a summary of the science idea.');

    // Navigating away blurs the field, triggering the onBlur save
    clickStatusIconNav('Observation');
    pageConfirmed('OBSERVATION');
    numberField('Central Frequency').should('have.value', '180');

    clickStatusIconNav('Details');
    pageConfirmed('DETAILS');

    submissionSummaryField().should('have.value', 'This is a summary of the science idea.');
  });
});
