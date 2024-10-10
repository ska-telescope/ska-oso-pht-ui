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
  verifyContinuumSpectralAverageRangeAA2();
  verifyContinuumSpectralAverageRangeAA1();
});

And('I verify spectral average limits for LOW Zoom observations', () => {
  verifyZoomSpectralAverageRangeAA2Core();
  verifyZoomSpectralAverageRangeCustom();
});

const verifyContinuumSpectralAverageRangeAA4 = value => {
  enterSpectralAverageValue(0);
  verifySpectralAverageRangeError();
  enterSpectralAverageValue(27625);
  verifySpectralAverageRangeError();
};

const verifyContinuumSpectralAverageRangeAA2 = value => {
  selectSubArrayAA2();
  enterSpectralAverageValue(0);
  verifySpectralAverageRangeError();
  enterSpectralAverageValue(13813);
  verifySpectralAverageRangeError();
};

const verifyContinuumSpectralAverageRangeAA1 = value => {
  selectSubArrayAA1();
  enterSpectralAverageValue(0);
  verifySpectralAverageRangeError();
  enterSpectralAverageValue(6907);
  verifySpectralAverageRangeError();
};

const verifyZoomSpectralAverageRangeAA2Core = value => {
  selectSubArrayAA2Core();
  selectObservationTypeZoom();
  enterSpectralAverageValue(0);
  verifySpectralAverageRangeError();
  enterSpectralAverageValue(865);
  verifySpectralAverageRangeError();
};

const verifyZoomSpectralAverageRangeCustom = value => {
  selectSubArrayCustom();
  enterSpectralAverageValue(0);
  verifySpectralAverageRangeError();
  enterSpectralAverageValue(865);
  verifySpectralAverageRangeError();
};
const enterSpectralAverageValue = value => {
  cy.get('[data-testid="spectralAveraging"]').type('{selectall}{del}');
  cy.get('[data-testid="spectralAveraging"]').type(value);
};

const selectSubArrayAA2 = value => {
  cy.get('[data-testid="subArrayConfiguration"]').click();
  cy.get('[data-value="3"]').click({ force: true });
};

const selectSubArrayAA2Core = value => {
  cy.get('[data-testid="subArrayConfiguration"]').click();
  cy.get('[data-value="4"]').click({ force: true });
};

const selectSubArrayAA1 = value => {
  cy.get('[data-testid="subArrayConfiguration"]').click();
  cy.get('[data-value="2"]').click({ force: true });
};

const selectSubArrayCustom = value => {
  cy.get('[data-testid="subArrayConfiguration"]').click();
  cy.get('[data-value="20"]').click({ force: true });
};

const selectObservationTypeZoom = value => {
  cy.get('[data-testid="observationType"]').click();
  cy.get('[data-value="0"]').click({ force: true });
};

const verifySpectralAverageRangeError = () => {
  cy.get('[id="spectralAveraging-helper-text"]').should(
    'contain',
    'Value is outside of allowed range'
  );
};
