import { Given, When, Then, And } from 'cypress-cucumber-preprocessor/steps';
import {
  addAbstract,
  addM2TargetUsingResolve,
  clickAddObservation,
  clickEditProposal,
  clickHome,
  clickObservationFromTable,
  clickObservationSetup,
  clickToAddTarget,
  clickToGeneralPage,
  clickToLinkTargetAndObservation,
  clickToObservationPage,
  clickToSciencePage,
  // clickToObservatoryDataProductPage,
  clickToTargetPage,
  clickToTeamPage,
  clickToTechnicalPage,
  clickToValidateProposal,
  createStandardProposal,
  verifyObservationInTable,
  verifyFirstProposalOnLandingPageIsVisible,
  verifyOnLandingPage,
  pageConfirmed,
  selectCosmology,
  clickToSubmitProposal,
  clickToConfirmProposalSubmission,
  verifyFirstProposalOnLandingPageHasSubmittedStatus,
  verifyProposalValidAlertFooter,
  verifyOnLandingPageFilterIsVisible,
  addTeamMember
  // clickAddDataProduct
  // addObservatoryDataProduct
  // verifyEmailSentAlertFooter
} from '../common/common';

Given('I am a PHT user who wants to continue editing my previously created proposal', () => {
  createStandardProposal();
});

When('I get on the landing page and click on the edit button', () => {
  clickHome();
  verifyOnLandingPage();
  verifyOnLandingPageFilterIsVisible();
  verifyFirstProposalOnLandingPageIsVisible();
  clickEditProposal();
  pageConfirmed('TITLE');
});

Then(
  'I am able to continue my proposal from where I stopped, fill in all the necessary details',
  () => {
    clickToTeamPage();
    addTeamMember();
    // verifyEmailSentAlertFooter();
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
    clickToTechnicalPage();
    // clickToObservatoryDataProductPage();
    // clickAddDataProduct();
    // addObservatoryDataProduct();
  }
);

And('I validate my proposal', () => {
  // clickToValidateProposal();
  // verifyProposalValidAlertFooter();
});

And('I submit my proposal', () => {
  // clickToSubmitProposal();
  // clickToConfirmProposalSubmission();
});

And('the proposal status should change to submitted', () => {
  // verifyFirstProposalOnLandingPageHasSubmittedStatus();
});
