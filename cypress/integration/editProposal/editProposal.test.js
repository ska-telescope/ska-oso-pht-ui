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
  clickToLinkTargetAndObservation,
  clickToNextPage,
  clickToObservationPage,
  clickToObservatoryDataProductPage,
  clickToPreviousPage,
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
  verifyOnLandingPageFilterIsVisible,
  verifyProposalIsValid,
  verifySensitivityCalculatorStatusSuccess
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
    verifySensitivityCalculatorStatusSuccess();
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
