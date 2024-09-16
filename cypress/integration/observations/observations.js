import { And, Given, Then, When } from 'cypress-cucumber-preprocessor/steps';
import {
  addM2TargetUsingResolve,
  clickAddObservation,
  clickObservationFromTable,
  clickObservationSetup,
  clickSensitivityCalculatorResults,
  clickToAddTarget,
  clickToGeneralPage,
  clickToLinkTargetAndObservation,
  clickToObservationPage,
  clickToSciencePage,
  clickToTargetPage,
  createStandardProposal,
  landingPageConfirmed,
  verifyObservationInTable
} from '../common/common';

Given('I have access to the PHT Application', () => {
  landingPageConfirmed();
});

And('I create a proposal', () => {
  createStandardProposal();
});

And('I have created an M2 target', () => {
  clickToGeneralPage();
  clickToSciencePage();
  clickToTargetPage();
  addM2TargetUsingResolve();
  clickToAddTarget();
});

And('I have navigated to the General Page', () => {
  clickToGeneralPage();
});

And('I have navigated to the Science Page', () => {
  clickToSciencePage();
});

And('I have navigated to the Target Page', () => {
  clickToTargetPage();
});
And('I have navigated to the Observation Page', () => {
  clickToObservationPage();
});

When('I create a LOW Continuum observation using default values', () => {
  clickObservationSetup();
  clickAddObservation();
  verifyObservationInTable();
});

And('I have a LOW Continuum observation linked with an M2 target', () => {
  clickObservationFromTable();
  clickToLinkTargetAndObservation();
});

And('I click to view sensitivity calculator results', () => {
  clickSensitivityCalculatorResults();
});

Then('the sensitivity calculator results for a LOW Continuum observation are valid', () => {
  //TODO: Implement once linking of target/observations has been refactored
});
