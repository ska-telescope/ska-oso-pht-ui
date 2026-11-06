import { clearLocalStorage } from '../../../support/common';
import { standardUser } from '../../../support/users';
import { buildSvContinuumProposal } from '../../../support/editor/data/sv';
import { SV_CYCLE } from '../../../support/editor/cycles';
import {
  createProposal,
  fillPages,
  stubDocumentUpload,
  validateAndSubmit
} from '../../../support/editor/editorActions';
import type { PageObject } from '../../../support/editor/types';

// The status a page's breadcrumb shows, e.g. "OK" or "Error". Looks in the whole page, even when
// called within the validation dialog.
const breadcrumbStatus = (page: PageObject) =>
  cy
    .get(`[aria-label^="Status of the ${page.name.toLowerCase()} page : "]`, {
      withinSubject: null
    })
    .first()
    .invoke('attr', 'aria-label')
    .then((label) => label?.split(' : ')[1]);

describe('SV proposal validation', () => {
  const proposal = buildSvContinuumProposal();

  afterEach(() => {
    clearLocalStorage();
  });

  it('lists the same pages with errors as the breadcrumb, and allows submitting once they are fixed', () => {
    stubDocumentUpload();
    createProposal(standardUser, SV_CYCLE, proposal);

    // A new proposal has pages still to complete
    cy.findByRole('button', { name: 'Validate / Submit' }).click();
    cy.findByRole('dialog').within(() => {
      cy.findByText('Validation issues');
      SV_CYCLE.pages.forEach((page) =>
        breadcrumbStatus(page).then((status) =>
          cy.findByText(page.pageValidationError).should(status === 'OK' ? 'not.exist' : 'exist')
        )
      );
      cy.findByRole('button', { name: 'Close' }).click();
    });

    fillPages(SV_CYCLE.pages, proposal);
    SV_CYCLE.pages.forEach((page) => breadcrumbStatus(page).should('equal', 'OK'));
    validateAndSubmit(SV_CYCLE, proposal);
  });
});
