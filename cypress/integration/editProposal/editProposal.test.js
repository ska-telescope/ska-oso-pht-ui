import {
  addAbstract,
  addM2TargetUsingResolve,
  addObservatoryDataProduct,
  addTeamMember,
  clickAddDataProduct,
  clickAddObservation,
  clickAddProposal,
  clickCreateProposal,
  clickEditProposal,
  clickHome,
  clickObservationFromTable,
  clickObservationSetup,
  clickProposalTypePrincipleInvestigator,
  clickSave,
  clickSubProposalTypeTargetOfOpportunity,
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
  clickToValidateProposal,
  createStandardProposal,
  enterProposalTitle,
  pageConfirmed,
  selectCosmology,
  verifyEmailSentAlertFooter,
  verifyFirstProposalOnLandingPageHasSubmittedStatus,
  verifyFirstProposalOnLandingPageIsVisible,
  verifyObservationInTable,
  verifyOnLandingPage,
  verifyOnLandingPageFilterIsVisible,
  verifyProposalCreatedAlertFooter,
  verifyProposalValidAlertFooter
} from '../common/common';

describe('Edit Proposal', () => {
  it('Edit a basic proposal', { jiraKey: 'XTP-71405' }, () => {
    //create basic proposal
    createStandardProposal();
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
    clickToValidateProposal();
    verifyProposalValidAlertFooter();
    //submit proposal
    clickToSubmitProposal();
    clickToConfirmProposalSubmission();
    //verify status of submitted proposal
    verifyFirstProposalOnLandingPageHasSubmittedStatus();
  });
});
