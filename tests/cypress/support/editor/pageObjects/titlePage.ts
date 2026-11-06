import type { PageObject } from '../types';

const titleField = () => cy.findByRole('textbox', { name: 'Title' });

export const titlePage: PageObject = {
  name: 'Title',
  heading: 'TITLE',
  pageValidationError: 'The TITLE page is not complete',
  // The title is entered when the proposal is created (see createProposal), so there is
  // nothing left to fill here
  fill: () => {},
  verify: (proposal) => titleField().should('have.value', proposal.title)
};
