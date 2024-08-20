import { Given, When, Then, And } from 'cypress-cucumber-preprocessor/steps';
import {
  addAbstract,
  addM1TargetUsingResolve,
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
  clickToObservatoryDataProductPage,
  clickToTargetPage,
  clickToTeamPage,
  clickToTechnicalPage,
  clickToValidateProposal,
  createStandardProposal,
  verifyObservationInTable,
  verifyProposalOnLandingPage,
  verifyOnLandingPage,
  pageConfirmed,
  selectCosmology,
  verifyProposalValidAlertFooter
} from '../common/common';

Given('I am a PHT user who wants to continue editing my previously created proposal', () => {
  createStandardProposal()
});

When('I get on the landing page and click on the edit button', () => {
  clickHome()
  verifyOnLandingPage()
  verifyProposalOnLandingPage()
  clickEditProposal()
  pageConfirmed('TITLE');
});

Then('I am able to continue my proposal from where I stopped, fill in all the necessary details', () => {
  clickToTeamPage()
  clickToGeneralPage()
  addAbstract()
  selectCosmology()
  clickToSciencePage()
  clickToTargetPage()
  addM1TargetUsingResolve()
  clickToAddTarget()
  clickToObservationPage()
  clickObservationSetup()
  clickAddObservation()
  verifyObservationInTable()
  clickObservationFromTable()
  clickToLinkTargetAndObservation()
  clickToTechnicalPage()
  clickToObservatoryDataProductPage()
});

And('I validate my proposal', () => {
  clickToValidateProposal()
  verifyProposalValidAlertFooter()
});

And('I submit my proposal', () => {
  //TODO: Implement step when functionality is available
});

And('the proposal status should change to submitted', () => {
  //TODO: Implement step when functionality is available
});