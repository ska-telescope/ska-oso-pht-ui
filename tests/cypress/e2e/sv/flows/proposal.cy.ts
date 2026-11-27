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
// records each lookup, and adds them to a failure's message to show what the backend did.
const recordCalibratorLookups = () => {
  const lookups: string[] = [];
  cy.intercept('POST', /\/calibrators\?/, (req) => {
    const started = Date.now();
    const query = new URL(req.url).search;
    const index = lookups.push(`${query}: no response`) - 1;
    req.continue((res) => {
      lookups[index] = `${query}: ${res.statusCode} after ${Date.now() - started}ms`;
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
