import {
  addAbstract,
  addM2TargetUsingResolve,
  addObservatoryDataProduct,
  addInvestigator,
  clickAddDataProduct,
  clickEditProposal,
  clickHome,
  clickObservationSetup,
  clickAddObservationEntry,
  verifySensitivityCalculatorStatusSuccess,
  clickSave,
  clickToAddTarget,
  clickToGeneralPage,
  clickToObservationPage,
  clickObservationFromTable,
  clickToLinkTargetAndObservation,
  clickToObservatoryDataProductPage,
  clickToSciencePage,
  clickToTargetPage,
  clickToTeamPage,
  clickToTechnicalPage,
  createStandardProposal,
  initialize,
  pageConfirmed,
  selectCosmology,
  validateProposal,
  verifyEmailSentAlertFooter,
  verifyObservationInTable,
  verifyOnLandingPage,
  verifyOnLandingPageFilterIsVisible,
  verifyHomeButtonWarningModal,
  clickHomeWarningConfirmation,
  mockCreateProposalAPI,
  createStandardProposalLoggedIn,
  verifyMockedProposalOnLandingPageIsVisible,
  verifyProposalCreatedAlertFooter
} from '../common/common';

beforeEach(() => {
  initialize();
  cy.mockLoginButton();
  mockCreateProposalAPI();
  createStandardProposalLoggedIn();
});

describe('Edit Proposal', () => {
  it('Edit a basic proposal', { jiraKey: 'XTP-71405' }, () => {
    cy.wait('@mockCreateProposal');
    verifyProposalCreatedAlertFooter();
    pageConfirmed('TEAM');
    //edit existing proposal
    clickHome();
    verifyOnLandingPage();
    verifyOnLandingPageFilterIsVisible();
    verifyMockedProposalOnLandingPageIsVisible();
    clickEditProposal();
    pageConfirmed('TITLE');
    //complete mandatory fields
    clickToTeamPage();
    addInvestigator();
    verifyEmailSentAlertFooter();
    // clickToGeneralPage();
    // addAbstract();
    // selectCosmology();
    // clickToSciencePage();
    // clickToTargetPage();
    // addM2TargetUsingResolve();
    // clickToAddTarget();
    // clickToObservationPage();
    // clickObservationSetup();
    // clickAddObservationEntry();
    // verifyObservationInTable();
    // clickObservationFromTable();
    // clickToLinkTargetAndObservation();
    // verifySensitivityCalculatorStatusSuccess();
    // // clickSave(); // TODO uncomment once login is handled in e2e tests
    // clickToTechnicalPage();
    // clickToObservatoryDataProductPage();
    // clickAddDataProduct();
    // addObservatoryDataProduct();
    // //validate proposal
    // // validateProposal();  // TODO uncomment once login is handled in e2e tests
    // //TODO: The remainder of this scenario can be reinstated upon completion of STAR-954
    // // verifyProposalIsValid()
    // //submit proposal
    // // clickToSubmitProposal();
    // // clickToConfirmProposalSubmission();
    // // //verify status of submitted proposal
    // // verifyFirstProposalOnLandingPageHasSubmittedStatus();
  });
});
