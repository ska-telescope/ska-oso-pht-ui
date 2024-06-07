
export function startingPoint() {
  cy.viewport(1500, 1500);
  cy.visit('http://localhost:6101/');
}

function landingPage() {
  cy.get('[data-testid="skaoLogo"]').should('be.visible');
  cy.get('[data-testid="Brightness7Icon"]').should('be.visible');
  cy.get('[data-testid="footerId"]')
  .should('be.visible')
  .contains('0.3.0');

  cy.get('[data-testid="addProposalButton"]').should('be.visible');
}

context('PROPOSAL HANDLING TOOL', () => {
  beforeEach(() => {
    startingPoint();
  });

  it('Content : Create basic proposal', () => {
    landingPage();
    cy.get('[data-testid="addProposalButton"]').click();
    //
    // Complete title page
    //
    cy.get('[data-testid="titleId"]').type('Basic Proposal');
    cy.get('[id="ProposalType-1"]').click({ force: true });
    cy.get('[aria-label="A target of opportunity observing proposal"]').click();
    cy.get('[data-testid="CreateButton"]').click();
    //
    // Return to Home page
    //
    cy.get('[data-testid="homeButtonTestId"]').click();
  });
});
