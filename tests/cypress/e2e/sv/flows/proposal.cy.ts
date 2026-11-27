import { clearLocalStorage } from '../../../support/common';
import { standardUser } from '../../../support/users';
import { SV_PROPOSALS } from '../../../support/editor/data/sv';
import { SV_CYCLE } from '../../../support/editor/cycles';
import {
  createProposal,
  fillPages,
  reopenFromBackend,
  saveAndExit,
  step,
  stubDocumentUpload,
  validateAndSubmit,
  verifyPages
} from '../../../support/editor/editorActions';

// The app looks the calibrator up from oso-services once, and has none if that lookup fails (see
// lookupCalibrators). The flow has occasionally failed in CI with an empty calibrator, so this
// records each lookup, adds them to a failure's message, and (afterEach) writes them to the
// artefacts for passing tests too, to show what the backend did. Start times are UTC, to match
// the oso-services log that stop-js-e2e-test keeps.
const CALIBRATOR_LOOKUPS_FILE = 'tests/cypress/artefacts/calibrator-lookups.txt';
let lookups: string[] = [];

const recordCalibratorLookups = () => {
  lookups = [];
  cy.intercept('POST', /\/calibrators\?/, (req) => {
    const started = new Date();
    const query = new URL(req.url).search;
    const lookup = (outcome: string) => `${started.toISOString()} ${query}: ${outcome}`;
    const index = lookups.push(lookup('no response')) - 1;
    req.continue((res) => {
      lookups[index] = lookup(`${res.statusCode} after ${Date.now() - started.getTime()}ms`);
    });
  });
  cy.on('fail', (error) => {
    const original = error.message;
    error.message += `\nCalibrator lookups: ${lookups.length ? lookups.join('; ') : 'none'}`;
    // Cypress reports the stack, which already starts with the original message
    error.stack = error.stack?.replace(original, error.message);
    throw error;
  });
};

// One test per observing mode, each covering the whole flow. Retries are off because a retry
// would repeat the flow from the start and create another proposal.
describe('SV proposal flow', { retries: 0 }, () => {
  afterEach(() => {
    const test = Cypress.currentTest;
    cy.writeFile(
      CALIBRATOR_LOOKUPS_FILE,
      `${test.title}\n${lookups.map((lookup) => `  ${lookup}\n`).join('') || '  none\n'}`,
      { flag: 'a+' }
    );
    clearLocalStorage();
  });

  // Continuum: XTP-96352, Spectral: XTP-96345, PST: XTP-96353
  SV_PROPOSALS.map((buildProposal) => buildProposal()).forEach((proposal) => {
    it(`${proposal.details.observingMode}: creates an SV proposal, keeps its values through navigation and reload, and submits it`, () => {
      stubDocumentUpload();
      recordCalibratorLookups();

      step('Create', () => createProposal(standardUser, SV_CYCLE, proposal));
      fillPages(SV_CYCLE.pages, proposal);
      verifyPages(SV_CYCLE.pages, proposal, 'after navigation');

      saveAndExit();
      reopenFromBackend(SV_CYCLE);
      verifyPages(SV_CYCLE.pages, proposal, 'after reload');

      step('Submit', () => validateAndSubmit(SV_CYCLE, proposal));
    });
  });
});
