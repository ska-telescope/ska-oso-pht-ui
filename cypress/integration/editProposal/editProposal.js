import { Given, When, Then, And } from 'cypress-cucumber-preprocessor/steps';
import {
  addAbstract,
  addTargetUsingResolve,
  clickAddObservation,
  clickEditProposal,
  clickHome,
  clickObservationFromTable,
  clickObservationSetup,
  clickSaveProposal,
  clickToAddTarget,
  clickToGeneralPage,
  clickToLinkTargetAndObservation,
  clickToObservationPage,
  clickToSciencePage,
  clickToSDPDataPage,
  clickToTargetPage,
  clickToTeamPage,
  clickToTechnicalPage,
  clickToValidateProposal,
  createStandardProposal,
  verifyObservationInTable,
  verifyProposalOnLandingPage
} from '../common/common';

Given('I am a PHT user who wants to continue editing my previously created proposal', () => {
  createStandardProposal();
  clickSaveProposal();
});

When('I get on the landing page and click on the edit button', () => {
  clickHome();
  verifyProposalOnLandingPage();
  clickEditProposal();
});

Then(
  'I am able to continue my proposal from where I stopped, fill in all the necessary details',
  () => {
    clickToTeamPage();
    clickToGeneralPage();
    addAbstract();
    clickToSciencePage();
    clickToTargetPage();
    addTargetUsingResolve();
    clickToAddTarget();
    clickToObservationPage();
    clickObservationSetup();
    clickAddObservation();
    verifyObservationInTable();
    clickObservationFromTable();
    clickToLinkTargetAndObservation();
    clickToTechnicalPage();
    clickToSDPDataPage();
  }
);

And('I validate my proposal', () => {
  clickToValidateProposal();
});

And('I submit my proposal', () => {
  //TODO: Implement step when functionality is available
});

And('the proposal status should change to submitted', () => {
  //TODO: Implement step when functionality is available
});
