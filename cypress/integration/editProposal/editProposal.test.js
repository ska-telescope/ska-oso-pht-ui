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
  clickToObservationPage,
  clickToObservatoryDataProductPage,
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
    clickAddDataProduct();
    addObservatoryDataProduct();
    //validate proposal
    validateProposal();
    //submit proposal
    clickToSubmitProposal();
    clickToConfirmProposalSubmission();
    //verify status of submitted proposal
    verifyFirstProposalOnLandingPageHasSubmittedStatus();
  });
});
