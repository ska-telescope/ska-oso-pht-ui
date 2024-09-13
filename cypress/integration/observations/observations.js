import { And, Given, Then, When } from 'cypress-cucumber-preprocessor/steps';
import {
  clickToGeneralPage,
  clickToObservationPage,
  clickToSciencePage,
  clickToTargetPage,
  clickToTeamPage,
  createStandardProposal,
  landingPageConfirmed
} from '../common/common';

Given('I have access to the PHT Application', () => {
  landingPageConfirmed();
});

And('I have navigated to the Observation Page', () => {
  createStandardProposal();
  clickToTeamPage();
  clickToGeneralPage();
  clickToSciencePage();
  clickToTargetPage();
  clickToObservationPage();
});
When('I create a LOW Continuum observation using default values', () => {

});

Then('the sensitivity calculator results for a LOW Continuum observation are valid', () => {

});