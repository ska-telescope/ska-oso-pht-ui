import { And, Given, Then, When } from 'cypress-cucumber-preprocessor/steps';
import {
  clickObservationSetup,
  clickToGeneralPage,
  clickToObservationPage,
  clickToSciencePage,
  clickToTargetPage,
  createStandardProposal,
  landingPageConfirmed
} from '../common/common';

Given('I have access to the PHT Application', () => {
  landingPageConfirmed();
});

And('I have navigated to the Observation Page', () => {
  createStandardProposal();
  clickToGeneralPage();
  clickToSciencePage();
  clickToTargetPage();
  clickToObservationPage();
});

When('I begin to add an observation setup', () => {
  clickObservationSetup();
});

Then('I verify spectral average limits for LOW Continuum observations', () => {
  verifyContinuumSpectralAverageRangeAA4();
});

And('I verify spectral average limits for LOW Zoom observations', () => {});

const verifyContinuumSpectralAverageRangeAA4 = value => {
  enterSpectralAverageValue(0);
  verifySpectralAverageRangeError();
  enterSpectralAverageValue(27625);
  verifySpectralAverageRangeError();
};

const enterSpectralAverageValue = value => {
  cy.get('[data-testid="spectralAveraging"]').type('{selectall}{del}');
  cy.get('[data-testid="spectralAveraging"]').type(value);
};

const verifySpectralAverageRangeError = () => {
  cy.get('[id="spectralAveraging-helper-text"]').should(
    'contain',
    'Value is outside of allowed range'
  );
};
