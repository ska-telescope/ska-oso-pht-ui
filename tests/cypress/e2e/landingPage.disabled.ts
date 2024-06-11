export function startingPoint() {
  cy.viewport(1500, 1500);
  cy.visit('http://localhost:6101/');
}

function landingPage() {
  cy.get('[data-testid="skaoLogo"]').should('be.visible');
  // TODO CHECK THERE IS A TITLE AND IT IS CORRECT
  // TODO CHECK THERE IS A DOCUMENT ICON AND IT WORKS
  cy.get('[data-testid="Brightness7Icon"]').should('be.visible');
  cy.get('[data-testid="footerId"]')
    .should('be.visible')
    .contains('0.3.0');
  cy.get('[data-testid="addProposalButton"]').should('be.visible');
}

describe('PHT : Look at the first page only', () => {
  it('passes', () => {
    startingPoint();
    landingPage();
  });
});
