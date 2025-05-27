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

const updateDropdown = (id, value) => {
  cy.get('[data-testid="' + id + '"]', { timeout: 10000 }).click();
  cy.get('[data-value="' + value + '"]', { timeout: 10000 }).click({ force: true });
};

const updateBand = rec => updateDropdown('observingBand', rec.band);
const updateSubarray = rec => updateDropdown('subArrayConfiguration', rec.subarray);
const updateObservationType = rec => updateDropdown('observationType', rec.observationType);

const verifyField = (id, value) => {
  if (value !== '') {
    cy.get('[id="' + id + '"]').should('contain', value);
  }
};

const verifyWeightedContinuumSensitivity = rec =>
  verifyField('continuumSensitivityWeightedLabel', rec.weightedContinuumSensitivity);

const verifyContinuumConfusionNoise = rec =>
  verifyField('continuumConfusionNoiseLabel', rec.continuumConfusionNoise);

const verifyTotalContinuumSensitivity = rec =>
  verifyField('continuumTotalSensitivityLabel', rec.totalContinuumSensitivity);

const verifyContinuumSurfaceBrightnessSensitivity = rec =>
  verifyField(
    'continuumSurfaceBrightnessSensitivityLabel',
    rec.continuumSurfaceBrightnessSensitivity
  );

const verifyWeightedSpectralSensitivity = rec =>
  verifyField('spectralSensitivityWeightedLabel', rec.weightedSpectralSensitivity);

const verifySpectralConfusionNoise = rec =>
  verifyField('spectralConfusionNoiseLabel', rec.spectralConfusionNoise);

const verifyTotalSpectralSensitivity = rec =>
  verifyField('spectralTotalSensitivityLabel', rec.totalSpectralSensitivity);

const verifySpectralSynthesizedBeamSize = rec =>
  verifyField('spectralSynthBeamSizeLabel', rec.spectralSynthesizedBeamSize);

const verifySpectralSurfaceBrightnessSensitivity = rec =>
  verifyField(
    'spectralSurfaceBrightnessSensitivityLabel',
    rec.spectralSurfaceBrightnessSensitivity
  );

const verifySensitivityCalculatorResults = rec => {
  verifyWeightedContinuumSensitivity(rec);
  verifyContinuumConfusionNoise(rec);
  verifyTotalContinuumSensitivity(rec);
  verifyContinuumSurfaceBrightnessSensitivity(rec);
  verifyWeightedSpectralSensitivity(rec);
  verifySpectralConfusionNoise(rec);
  verifyTotalSpectralSensitivity(rec);
  verifySpectralSynthesizedBeamSize(rec);
  verifySpectralSurfaceBrightnessSensitivity(rec);
};

describe('Sensitivity Calculator', () => {
  for (const rec of sensitivityCalculatorResults) {
    it('Sensitivity calculator results : ' + rec.test, { jiraKey: 'XTP-71885' }, () => {
      //add observation
      clickObservationSetup();
      updateBand(rec);
      updateSubarray(rec);
      updateObservationType(rec);
      clickAddObservation();
      verifyObservationInTable();
      //
      clickObservationFromTable();
      clickToLinkTargetAndObservation();
      verifySensitivityCalculatorStatusSuccess();
      clickToViewSensitivityCalculatorResults();
      verifySensitivityCalculatorResults(rec);
    });
  }
});
