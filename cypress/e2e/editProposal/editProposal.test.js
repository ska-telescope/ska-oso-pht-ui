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
  clickSave,
  clickToAddTarget,
  clickToGeneralPage,
  clickToObservationPage,
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
    clickAddObservation();
    verifyObservationInTable();
    // clickObservationFromTable();
    // clickToLinkTargetAndObservation();
    // verifySensitivityCalculatorStatusSuccess();
    clickSave();
    clickToTechnicalPage();
    clickToObservatoryDataProductPage();
    clickAddDataProduct();
    addObservatoryDataProduct();
    //validate proposal
    validateProposal();
    //TODO: The remainder of this scenario can be reinstated upon completion of STAR-954
    // verifyProposalIsValid()
    //submit proposal
    // clickToSubmitProposal();
    // clickToConfirmProposalSubmission();
    // //verify status of submitted proposal
    // verifyFirstProposalOnLandingPageHasSubmittedStatus();
  });
});
