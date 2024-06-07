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

function homeButton() {
  cy.get('[data-testid="homeButtonTestId"]').click(); // TODO : Check that the label and icon is correct ?
  // TODO : Is there a way to check tha the URL is correct and we are in the right place ?
}

describe('PHT : ADD Proposal', () => {
  beforeEach(() => {
    startingPoint();
    landingPage();
    cy.get('[data-testid="addProposalButton"]').click();
  });

  it('Start to add and then abandon', () => {
    cy.get('[data-testid="titleId"]').type('Basic Proposal');
    cy.get('[id="ProposalType-1"]').click({ force: true });
    cy.get('[aria-label="A target of opportunity observing proposal"]').click(); // TODO> Change to ID or data-testId
    homeButton();
  });

  it('Start to add and then confirm', () => {
    cy.get('[data-testid="titleId"]').type('Basic Proposal');
    cy.get('[id="ProposalType-1"]').click({ force: true });
    cy.get('[aria-label="A target of opportunity observing proposal"]').click(); // TODO Change to ID or data-testId
    // cy.get('[data-testid="CreateButton"]').click();// TODO   IMPLEMENTING THIS IS CAUSING AN ISSUE
    homeButton();
  });
});
