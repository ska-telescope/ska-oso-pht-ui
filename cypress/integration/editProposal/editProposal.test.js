import {
  addAbstract,
  addM2TargetUsingResolve,
  addObservatoryDataProduct,
  addTeamMember,
  clickAddDataProduct,
  clickAddObservation,
  clickEditProposal,
  clickHome,
  clickObservationFromTable,
  clickObservationSetup,
  clickSave,
  clickToAddTarget,
  clickToConfirmProposalSubmission,
  clickToGeneralPage,
  clickToLinkTargetAndObservation, clickToNextPage,
  clickToObservationPage,
  clickToObservatoryDataProductPage, clickToPreviousPage,
  clickToSciencePage,
  clickToSubmitProposal,
  clickToTargetPage,
  clickToTeamPage,
  clickToTechnicalPage,
  createStandardProposal,
  pageConfirmed,
  selectCosmology,
  validateProposal,
  verifyEmailSentAlertFooter,
  verifyFirstProposalOnLandingPageHasSubmittedStatus,
  verifyFirstProposalOnLandingPageIsVisible,
  verifyObservationInTable,
  verifyOnLandingPage,
  verifyOnLandingPageFilterIsVisible
} from '../common/common';

beforeEach(() => {
  createStandardProposal();
});

describe('Edit Proposal', () => {
  it('Edit a basic proposal', { jiraKey: 'XTP-71405' }, () => {
    //edit existing proposal
    clickHome();
    verifyOnLandingPage();
    verifyOnLandingPageFilterIsVisible();
    verifyFirstProposalOnLandingPageIsVisible();
    clickEditProposal();
    pageConfirmed('TITLE');
    //complete mandatory fields
    clickToTeamPage();
    addTeamMember();
    verifyEmailSentAlertFooter();
    clickToGeneralPage();
    addAbstract();
    selectCosmology();
    clickToSciencePage();
    clickToTargetPage();
    addM2TargetUsingResolve();
    clickToAddTarget();
    clickToObservationPage();
    clickObservationSetup();
    clickAddObservation();
    verifyObservationInTable();
    clickObservationFromTable();
    clickToLinkTargetAndObservation();
    clickSave();
    clickToTechnicalPage();
    clickToObservatoryDataProductPage();
    //check if add data product is disabled
    // if (cy.get('[data-testid="addDataProductButton"]').should('be.disabled')) {
    //   clickToPreviousPage();
    //   clickToNextPage();
    //   clickAddDataProduct();
    // } else {
    //   cy.get('[data-testid="addDataProductButton"]').click();
    // }
    if(cy.get('[data-testid="addDataProductButton"]').should('be.disabled')){
      console.log("Chloe .. button disabled so going back to pages ")
      // clickToPreviousPage();
      // clickToNextPage();
      cy.go('back')
      cy.go('forward')
      clickAddDataProduct();
    }
    if(cy.get('[data-testid="addDataProductButton"]').should('not.be.disabled')){
      console.log("Chloe .. button abled so adding data product")
      clickAddDataProduct();
    }
    // addObservatoryDataProduct();
    // //validate proposal
    // validateProposal();
    // //submit proposal
    // clickToSubmitProposal();
    // clickToConfirmProposalSubmission();
    // //verify status of submitted proposal
    // verifyFirstProposalOnLandingPageHasSubmittedStatus();
  });
});
