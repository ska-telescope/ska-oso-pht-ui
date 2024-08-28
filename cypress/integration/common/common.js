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

// export const verifyProposalCreatedAlertFooter = () => {
//   cy.on('window:alert', str => {
//     expect(str).to.include('Proposal added with unique identifier');
//     done();
//   });
// };

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
  cy.wait(3000);
  clickCreateProposal();
  // verifyProposalCreatedAlertFooter();
};

export const clickHome = () => {
  cy.get('[data-testid="homeButtonTestId"]').should('exist');
  cy.get('[data-testid="homeButtonTestId"]').click();
};

export const clickToTeamPage = () => {
  cy.get('[data-testid="nextButtonTestId"]').should('exist');
  cy.get('[data-testid="nextButtonTestId"]').click();
};

export const clickToGeneralPage = () => {
  cy.get('[data-testid="nextButtonTestId"]').should('exist');
  cy.get('[data-testid="nextButtonTestId"]').click();
};

export const clickToSciencePage = () => {
  cy.get('[data-testid="nextButtonTestId"]').should('exist');
  cy.get('[data-testid="nextButtonTestId"]').click();
};

export const clickToTargetPage = () => {
  cy.get('[data-testid="nextButtonTestId"]').should('exist');
  cy.get('[data-testid="nextButtonTestId"]').click();
};

export const clickToObservationPage = () => {
  cy.get('[data-testid="nextButtonTestId"]').should('exist');
  cy.get('[data-testid="nextButtonTestId"]').click();
};

export const clickToTechnicalPage = () => {
  cy.get('[data-testid="nextButtonTestId"]').should('exist');
  cy.get('[data-testid="nextButtonTestId"]').click();
};

export const clickToObservatoryDataProductPage = () => {
  cy.get('[data-testid="nextButtonTestId"]').should('exist');
  cy.get('[data-testid="nextButtonTestId"]').click();
};

export const addAbstract = () => {
  cy.get('[id="abstractId"]').should('exist');
  cy.get('[id="abstractId"]').type('Test abstract');
};

export const addM1TargetUsingResolve = () => {
  cy.get('[id="name"]').should('exist');
  cy.get('[id="name"]').type('M1');
  cy.get('[data-testid="resolveButton"]').click();
};

export const clickToAddTarget = () => {
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
