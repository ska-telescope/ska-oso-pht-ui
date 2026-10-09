const titleField = () => cy.findByRole('textbox', { name: 'Title' });

export const titlePage = {
  name: 'Title',
  heading: 'TITLE',
  // The title is entered when the proposal is created (see createProposal), so there is
  // nothing left to fill here
  fill: () => {},
  verify: (proposal) => titleField().should('have.value', proposal.title)
};
