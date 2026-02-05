import {
  clickObservationFromTable,
  clickObservationSetup,
  clickToAddTarget,
  clickToLinkTargetAndObservation,
  clickToObservationPage,
  verifyObservationInTable,
  clickAddObservationEntry,
  initializeUserNotLoggedIn,
  clearLocalStorage,
  createMock
  // clickListOfTargets
} from '../../common/common';
import sensitivityCalculatorResults from '../../../fixtures/sensitivityCalculatorResults.json';

beforeEach(() => {
  initializeUserNotLoggedIn();
  cy.fixture('sensitivityCalculatorResults.json').as('sensitivityCalculatorResults');
  createMock();
  //add target
  // clickListOfTargets();
  addTargetUsingCoordinates();
  clickToAddTarget();
  clickToObservationPage();
});

afterEach(() => {
  clearLocalStorage();
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

const updateDropdown = (testId, value) => {
  cy.get('[data-testid="' + testId + '"]', { timeout: 10000 })
    .should('exist')
    .should('be.visible')
    .realClick();
  cy.get('[data-value="' + value + '"]', { timeout: 10000 }) // wait for it to appear
    .should('exist')
    .should('be.visible')
    .realClick();
  cy.get('body').click(0, 0);
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
    // TODO Scenario needs to be re-defined based on a non-logged in user flow - see STAR-1904
    it.skip('Sensitivity calculator results : ' + rec.test, { jiraKey: 'XTP-71885' }, () => {
      //add observation
      clickObservationSetup();
      updateBand(rec);
      updateSubarray(rec);
      updateObservationType(rec);
      clickAddObservationEntry();
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
