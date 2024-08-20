import { And, Given } from 'cypress-cucumber-preprocessor/steps';
import {
  clickToGeneralPage, clickToObservationPage,
  clickToSciencePage,
  clickToTargetPage,
  createStandardProposal,
  landingPageConfirmed
} from '../common/common';

Given('I have access to the PHT Application', () => {
  landingPageConfirmed()
});

And('I have navigated to the Observation Page', () => {
  createStandardProposal()
  clickToGeneralPage()
  clickToSciencePage()
  clickToTargetPage()
  clickToObservationPage()
});