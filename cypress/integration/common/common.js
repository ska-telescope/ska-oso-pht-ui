export const clickAddProposal = () => {
  verifyAddProposalButtonExists();
  clickAddProposalButton();
};

export const clickAddProposalButton = () => {
  cy.get('[data-testid="addProposalButton"]').click();
};

export const verifyAddProposalButtonExists = () => {
  cy.get('[data-testid="addProposalButton"]').should('exist');
};

export const enterProposalTitle = () => {
  cy.get('[id="titleId"]').type('Proposal Title');
};

export const selectCosmology = () => {
  cy.get('[data-testid="categoryId"]').click();
  cy.get('[data-value="1"]').click({ force: true });
};

export const clickStandardProposalSubTypeTargetOfOpportunity = () => {
  cy.get('[id="ProposalType-1"]').click({ force: true });
  cy.get('[id="proposalAttribute-1"]').click({ force: true });
};

export const clickCreateProposal = () => {
  cy.get('[data-testid="nextButtonTestId"]').click();
};

export const verifyProposalCreatedAlertFooter = () => {
  cy.on('window:alert', str => {
    expect(str).to.include('Proposal added with unique identifier');
    done();
  });
};

export const clickEditProposal = () => {
  cy.get("[data-testid='EditRoundedIcon']")
    .eq(0)
    .click();
};

export const pageConfirmed = label => {
  cy.get('#pageTitle').contains(label);
};

export const landingPageConfirmed = () => {
  verifyAddProposalButtonExists();
};

export const createStandardProposal = () => {
  clickAddProposalButton();
  pageConfirmed('TITLE');
  enterProposalTitle();
  clickStandardProposalSubTypeTargetOfOpportunity();
  clickCreateProposal();
  verifyProposalCreatedAlertFooter();
  pageConfirmed('TEAM');
};

export const clickHome = () => {
  cy.get('[data-testid="homeButtonTestId"]').should('exist');
  cy.get('[data-testid="homeButtonTestId"]').click();
};

export const clickToTeamPage = () => {
  clickToNextPage();
  pageConfirmed('TEAM');
};

export const addTeamMember = () => {
  cy.get('[data-testid="firstName"]').type('Test');
  cy.get('[data-testid="lastName"]').type('User');
  cy.get('[data-testid="email"]').type('TestUser@test.com');
  cy.get('[data-testid="sendInviteButton"]').click();
};

export const clickToGeneralPage = () => {
  clickToNextPage();
  pageConfirmed('GENERAL');
};

export const clickToSciencePage = () => {
  clickToNextPage();
  pageConfirmed('SCIENCE');
};

export const clickToTargetPage = () => {
  clickToNextPage();
  pageConfirmed('TARGET');
};

export const clickToObservationPage = () => {
  clickToNextPage();
  pageConfirmed('OBSERVATION');
};

export const clickToTechnicalPage = () => {
  clickToNextPage();
  pageConfirmed('TECHNICAL');
};

export const clickToObservatoryDataProductPage = () => {
  clickToNextPage();
  pageConfirmed('OBSERVATORY DATA PRODUCT');
};

export const clickToNextPage = () => {
  cy.get('[data-testid="nextButtonTestId"]').should('exist');
  cy.get('[data-testid="nextButtonTestId"]').click();
};

export const clickAddDataProduct = () => {
  cy.get('[data-testid="addDataProductButton"]', { timeout: 80000 }).should('be.enabled');
  cy.get('[data-testid="addDataProductButton"]').click();
};

export const addObservatoryDataProduct = () => {
  pageConfirmed('DATA PRODUCT');
  cy.get('[id="observations"]').click();
  cy.get('[data-value="0"]').click();
  cy.get('[data-testid="observatoryDataProduct1"]').click();
  cy.get('[id="imageSize"]').type('1');
};

export const addAbstract = () => {
  cy.get('[id="abstractId"]').should('exist');
  cy.get('[id="abstractId"]').type('Test abstract');
};

export const addM2TargetUsingResolve = () => {
  cy.get('[id="name"]').should('exist');
  cy.get('[id="name"]').type('M2');
  cy.get('[data-testid="resolveButton"]').click();
};

export const clickToAddTarget = () => {
  cy.get('[data-testid="addTargetButton"]').should('exist');
  cy.get('[data-testid="addTargetButton"]').click();
};

export const clickObservationSetup = () => {
  cy.get('[data-testid="addObservationButton"]').click();
};

export const clickAddObservation = () => {
  cy.get('[data-testid="addObservationButton"]').click();
};

export const verifyOnLandingPage = () => {
  cy.get('[data-testid="addProposalButton"]').should('exist');
};

export const verifyOnLandingPageFilterIsVisible = () => {
  cy.get('[data-testid="proposalType"]').should('exist');
  cy.get('[data-testid="proposalType"]').click();
  cy.get('[data-value="draft"]').click({ force: true });
};

export const verifyFirstProposalOnLandingPageIsVisible = () => {
  //TODO: Enable once cloud issues are resolved
  // cy.get('[data-testid="dataGridId"]')
  //   .should('contain', 'prsl-t0001-')
  //   .should('contain', 'Proposal Title');
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
  cy.get('[aria-label="Status : OK "]').should('exist');
};

export const clickToValidateProposal = () => {
  cy.get('[data-testid="validationBtnTestId"]').should('exist');
  cy.get('[data-testid="validationBtnTestId"]').click();
};

export const verifyProposalValidAlertFooter = () => {
  cy.on('window:alert', str => {
    expect(str).to.include('Proposal is Valid');
  });
};

export const clickToSubmitProposal = () => {
  cy.get('[data-testid="submitBtnTestId"]').should('exist');
  cy.get('[data-testid="submitBtnTestId"]').click();
};

export const clickToConfirmProposalSubmission = () => {
  cy.get('[data-testid="displayConfirmationButton"]').should('exist');
  cy.get('[data-testid="displayConfirmationButton"]').click();
};

export const verifyFirstProposalOnLandingPageHasSubmittedStatus = () => {
  cy.get('div[role="presentation"].MuiDataGrid-virtualScrollerContent > div[role="rowgroup"]')
    .eq(0)
    .children('div[role="row"]')
    .should('contain', 'prsl-t0001-')
    .should('contain', 'Proposal Title')
    .should('contain', 'Submitted');
};
