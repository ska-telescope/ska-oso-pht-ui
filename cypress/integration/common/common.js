export const clickAddProposal = () => {
  verifyAddProposalButtonExists()
  clickAddProposalButton()
};

export const clickAddProposalButton = () => {
  cy.get('[data-testid="addProposalButton"]').click();
};

export const verifyAddProposalButtonExists = () => {
  cy.get('[data-testid="addProposalButton"]').should('exist');
};

export const clickStandardProposalSubTypeTargetOfOpportunity = () => {
  cy.get('[id="titleId"]').type("Proposal Title");
  cy.get('[id="ProposalType-1"]').click({ force: true });
  cy.get('[aria-label="A target of opportunity observing proposal"]').click();
};

export const clickCreateProposal = () => {
  cy.get('[data-testid="CreateButton"]').click();
  cy.get('[data-testid="timeAlertFooter"]').should('exist');
  pageConfirmed('TEAM');
};

export const clickEditProposal = () => {
  cy.get('[data-testid="EditRoundedIcon"]').click();
  pageConfirmed('TITLE');
};

export const pageConfirmed = label => {
  cy.get('#pageTitle').contains(label);
};

export const landingPageConfirmed = ()  => {
  verifyAddProposalButtonExists()
};

export const createStandardProposal = ()  => {
  clickAddProposalButton()
  pageConfirmed('TITLE');
  clickStandardProposalSubTypeTargetOfOpportunity()
  clickCreateProposal()
  pageConfirmed('TEAM');
};

export const clickSaveProposal = () => {
  cy.get('[data-testid="saveButtonTestId"]').should('exist');
  cy.get('[data-testid="saveButtonTestId"]').click();
};

export const clickHome = () => {
  cy.get('[data-testid="homeButtonTestId"]').should('exist');
  cy.get('[data-testid="homeButtonTestId"]').click();
};

export const clickToTeamPage = () => {
  cy.get('[data-testid="TeamButton"]').should('exist');
  cy.get('[data-testid="TeamButton"]').click();
};

export const clickToGeneralPage = () => {
  cy.get('[data-testid="GeneralButton"]').should('exist');
  cy.get('[data-testid="GeneralButton"]').click();
};

export const clickToSciencePage = () => {
  cy.get('[data-testid="ScienceButton"]').should('exist');
  cy.get('[data-testid="ScienceButton"]').click();
};

export const clickToTargetPage = () => {
  cy.get('[data-testid="TargetButton"]').should('exist');
  cy.get('[data-testid="TargetButton"]').click();
};

export const clickToObservationPage = () => {
  cy.get('[data-testid="ObservationButton"]').should('exist');
  cy.get('[data-testid="ObservationButton"]').click();
};

export const clickToTechnicalPage = () => {
  cy.get('[data-testid="TechnicalButton"]').should('exist');
  cy.get('[data-testid="TechnicalButton"]').click();
};

export const clickToObservatoryDataProductPage = () => {
  cy.get('[data-testid="Observatory Data ProductButton"]').should('exist');
  cy.get('[data-testid="Observatory Data ProductButton"]').click();
};

export const addAbstract = () => {
  cy.get('[id="abstractId"]').should('exist');
  cy.get('[id="abstractId"]').type("Test abstract");
};

export const addTargetUsingResolve = () => {
  cy.get('[id="name"]').should('exist');
  cy.get('[id="name"]').type("M1");
  cy.get('[data-testid="resolveButton"]').click();
};

export const clickToAddTarget = () => {
  cy.get('[data-testid="addTargetButton"]').click();
};

export const clickObservationSetup = () => {
  cy.get('[data-testid="addObservationButton"]').click();
}

export const clickAddObservation = () => {
  cy.get('[data-testid="addObservationButton"]').click();
}

export const verifyOnLandingPage = () => {
  cy.get('[data-testid="addProposalButton"]').should('exist')
};

export const verifyProposalOnLandingPage = () => {
  cy.reload()
  cy.get('[data-testid="VisibilityRoundedIcon"]').should('exist')
};

export const verifyObservationInTable = () => {
  cy.get('div[role="presentation"].MuiDataGrid-virtualScrollerContent > div[role="rowgroup"]')
    .children('div[role="row"]')
    .should('contain', 'obs-')
    .should('contain', 'AA4')
    .should('have.length', 2);
};

export const clickObservationFromTable = () => {
  cy.get('[data-rowindex="0"]').click({ multiple: true });
};
export const clickToLinkTargetAndObservation = () => {
  cy.get('[data-testid="linkedTickBox"]').click();
};

export const clickToValidateProposal = () => {
  cy.get('[data-testid="ValidationTestId"]').should('exist');
  cy.get('[data-testid="ValidationTestId"]').click();
};