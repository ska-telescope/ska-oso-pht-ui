import {
  clickAddObservation,
  clickObservationFromTable,
  clickObservationSetup,
  clickToAddTarget,
  clickToGeneralPage,
  clickToLinkTargetAndObservation,
  clickToObservationPage,
  clickToSciencePage,
  clickToTargetPage,
  createStandardProposal,
  verifyObservationInTable
} from '../common/common';

import sensitivityCalculatorResults from '../../fixtures/sensitivityCalculatorResults.json';

beforeEach(() => {
  cy.fixture('sensitivityCalculatorResults.json').as('sensitivityCalculatorResults');
  createStandardProposal();
  //navigate to observation page
  clickToGeneralPage();
  clickToSciencePage();
  clickToTargetPage();
  //add target
  addTargetUsingCoordinates();
  clickToAddTarget();
  clickToObservationPage();
  //add default observation
  clickObservationSetup();
  clickAddObservation();
  verifyObservationInTable();
});

const addTargetUsingCoordinates = () => {
  cy.get('[id="name"]').should('exist');
  cy.get('[id="name"]').type('test');
  cy.get('[id="skyDirectionValue1"]').type('00:00:00.0');
  cy.get('[id="skyDirectionValue2"]').type('00:00:00.0');
};

const verifySensitivityCalculatorStatusSuccess = () => {
  cy.get('[data-testid="statusId"]').should('exist');
  cy.get('[aria-label="Status : OK "]').should('exist');
};

const clickToViewSensitivityCalculatorResults = () => {
  cy.get('[data-testid="statusId"]').click();
};

const verifyWeightedContinuumSensitivity = () => {
  cy.get('[id="continuumSensitivityWeightedLabel"]').should(
    'contain',
    sensitivityCalculatorResults[0].weightedContinuumSensitivity
  );
};

const verifyContinuumConfusionNoise = () => {
  cy.get('[id="continuumConfusionNoiseLabel"]').should(
    'contain',
    sensitivityCalculatorResults[0].continuumConfusionNoise
  );
};

const verifyTotalContinuumSensitivity = () => {
  cy.get('[id="continuumTotalSensitivityLabel"]').should(
    'contain',
    sensitivityCalculatorResults[0].totalContinuumSensitivity
  );
};

const verifyContinuumSurfaceBrightnessSensitivity = () => {
  cy.get('[id="continuumSurfaceBrightnessSensitivityLabel"]').should(
    'contain',
    sensitivityCalculatorResults[0].continuumSurfaceBrightnessSensitivity
  );
};

const verifyWeightedSpectralSensitivity = () => {
  cy.get('[id="spectralSensitivityWeightedLabel"]').should(
    'contain',
    sensitivityCalculatorResults[0].weightedSpectralSensitivity
  );
};

const verifySpectralConfusionNoise = () => {
  cy.get('[id="spectralConfusionNoiseLabel"]').should(
    'contain',
    sensitivityCalculatorResults[0].spectralConfusionNoise
  );
};

const verifyTotalSpectralSensitivity = () => {
  cy.get('[id="spectralTotalSensitivityLabel"]').should(
    'contain',
    sensitivityCalculatorResults[0].totalSpectralSensitivity
  );
};

const verifySpectralSynthesisedBeamSize = () => {
  cy.get('[id="spectralSynthBeamSizeLabel"]').should(
    'contain',
    sensitivityCalculatorResults[0].spectralSynthesisedBeamSize
  );
};

const verifySpectralSurfaceBrightnessSensitivity = () => {
  cy.get('[id="spectralSurfaceBrightnessSensitivityLabel"]').should(
    'contain',
    sensitivityCalculatorResults[0].spectralSurfaceBrightnessSensitivity
  );
};

const verifySensitivityCalculatorResults = () => {
  verifyWeightedContinuumSensitivity();
  verifyContinuumConfusionNoise();
  verifyTotalContinuumSensitivity();
  verifyContinuumSurfaceBrightnessSensitivity();
  verifyWeightedSpectralSensitivity();
  verifySpectralConfusionNoise();
  verifyTotalSpectralSensitivity();
  verifySpectralSynthesisedBeamSize();
  verifySpectralSurfaceBrightnessSensitivity();
};

describe('Sensitivity Calculator', () => {
  it(
    'Verify sensitivity calculator results for a Low Continuum AA4 observation',
    { jiraKey: 'XTP-71885' },
    () => {
      clickObservationFromTable();
      clickToLinkTargetAndObservation();
      verifySensitivityCalculatorStatusSuccess();
      clickToViewSensitivityCalculatorResults();
      verifySensitivityCalculatorResults();
    }
  );
});
