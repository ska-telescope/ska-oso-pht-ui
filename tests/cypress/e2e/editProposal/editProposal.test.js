import {
  addAbstract,
  addM2TargetUsingResolve,
  addObservatoryDataProduct,
  addTeamMember,
  clickAddDataProduct,
  clickAddObservation,
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
  verifyFirstProposalOnLandingPageIsVisible,
  verifyObservationInTable,
  verifyOnLandingPage,
  verifyOnLandingPageFilterIsVisible
} from '../common/common';

beforeEach(() => {
  initialize();
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
    clickAddObservationEntry();
    //clickObservationSetup();
    verifyObservationInTable();
    clickObservationFromTable();
    clickToLinkTargetAndObservation();
    verifySensitivityCalculatorStatusSuccess();
    // clickSave(); // TODO uncomment once login is handled in e2e tests
    clickToTechnicalPage();
    clickToObservatoryDataProductPage();
    clickAddDataProduct();
    addObservatoryDataProduct();
    //validate proposal
    // validateProposal();  // TODO uncomment once login is handled in e2e tests
    //TODO: The remainder of this scenario can be reinstated upon completion of STAR-954
    // verifyProposalIsValid()
    //submit proposal
    // clickToSubmitProposal();
    // clickToConfirmProposalSubmission();
    // //verify status of submitted proposal
    // verifyFirstProposalOnLandingPageHasSubmittedStatus();
  });
});
