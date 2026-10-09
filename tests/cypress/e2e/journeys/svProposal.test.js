import { clearLocalStorage } from '../common/common';
import { standardUser } from '../users/users';
import { buildSvContinuumProposal } from './data/sv';
import { SV_CYCLE } from './cycles';
import {
  createProposal,
  fillPages,
  reopenFromBackend,
  saveAndExit,
  step,
  stubDocumentUpload,
  verifyPages
} from './editorActions';
// One test for the whole journey. Retries are off because a retry would repeat the journey from
// the start and create another proposal.
describe('SV proposal journey', { retries: 0 }, () => {
  afterEach(() => {
    clearLocalStorage();
  });

  it('creates an SV proposal and keeps its values through navigation and reload', () => {
    const proposal = buildSvContinuumProposal();
    stubDocumentUpload();

    step('Create', () => createProposal(standardUser, SV_CYCLE, proposal));
    fillPages(SV_CYCLE.pages, proposal);
    verifyPages(SV_CYCLE.pages, proposal, 'after navigation');

    saveAndExit();
    reopenFromBackend(SV_CYCLE);
    verifyPages(SV_CYCLE.pages, proposal, 'after reload');

    // TODO: validate and submit
  });
});
