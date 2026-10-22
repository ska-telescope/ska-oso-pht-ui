import { clearLocalStorage } from '../../../support/common';
import { standardUser } from '../../../support/users';
import { buildSvContinuumProposal } from '../../../support/editor/data/sv';
import { SV_CYCLE } from '../../../support/editor/cycles';
import { createProposal } from '../../../support/editor/editorActions';

describe('SV Team page', () => {
  afterEach(() => {
    clearLocalStorage();
  });

  // Creating a proposal lands on the Team page
  it('shows the creator in the team with submit rights', () => {
    createProposal(standardUser, SV_CYCLE, buildSvContinuumProposal());

    // The header row plus one row for the creator. The rights column shows the highest right,
    // and is filled in once the proposal's access has been fetched from the backend.
    cy.findByRole('grid').findAllByRole('row').should('have.length', 2).eq(1).findByText('Submit');
  });

  // TODO: The member-invite flow is not fully implemented yet so this test is here just as a placeholder.
  //  We should decide if we can actually test the flow here since it requires user interaction with emails.
  it.skip('invites a member and edits their access rights');
});
