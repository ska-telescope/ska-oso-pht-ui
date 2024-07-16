describe('GIVEN that I am a user on the main page of the PHT', () => {
  context('WHEN I wish to create a minimal Proposal', () => {
  beforeEach(() => {
    cy.visit('http://localhost:6101/');
    cy.intercept(
      {
        method: 'POST'
      },
      []
    )
  });

  /*** Validate the page ****/
  const homePageConfirmed = () => {
    cy.get('[data-testid="addProposalButton"]').should('exist');
  }

  const pageConfirmed = (label) => {
    cy.get('#pageTitle').contains(label);
  }

  /**** Button clicks ****/

  const clickHomeButton = () => {
    cy.get('[data-testid="homeButtonTestId"]').should('exist').click();
    homePageConfirmed();
  }

  const clickAddProposal = () => {
    cy.get('[data-testid="addProposalButton"]').click();
    pageConfirmed('TITLE');
  }

  const clickCreateProposal = () => {
    cy.get('[data-testid="CreateButton"]').click();
    cy.get('[data-testid="timeAlertFooter"]').should('exist');
    pageConfirmed('TEAM');
  }

  /**** Page entry ****/

  const titlePageEntry = () => {
    cy.get('[data-testid="titleId"]').type('Test Proposal');
    cy.get('[id="ProposalType-1"]').click({ force: true });
    cy.get('[aria-label="A target of opportunity observing proposal"]').click();
  }

  /**** TESTS ****/

  it('THEN I can enter the details and confirm creation', () => {
    homePageConfirmed();
    clickAddProposal();
    titlePageEntry();
    clickCreateProposal();
    clickHomeButton();
  });
});
});
