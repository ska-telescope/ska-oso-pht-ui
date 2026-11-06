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
