export const teamPage = {
  name: 'Team',
  heading: 'TEAM',
  // Inviting a member will not be part of these tests (at least not yet) as how and where
  // to test the User Portal intivation/acceptance flow is still unclear
  fill: () => {},
  // The header row plus one row for the creator
  verify: () => cy.findByRole('grid').findAllByRole('row').should('have.length', 2)
};
