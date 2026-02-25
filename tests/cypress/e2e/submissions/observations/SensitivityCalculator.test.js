import {
  clickObservationFromTable,
  clickObservationSetup,
  clickToAddTarget,
  clickToLinkTargetAndObservation,
  clickToObservationPage,
  verifyObservationInTable,
  clickAddObservationEntry,
  clearLocalStorage,
  initialize,
  mockOSDAPI,
  mockCreateProposalAPI,
  clickAddSubmission,
  clickCycleSelectionMockProposal,
  clickCycleConfirm,
  enterProposalTitle,
  clickProposalTypePrincipleInvestigator,
  clickSubProposalTypeTargetOfOpportunity,
  clickCreateSubmission,
  verifySubmissionCreatedAlertFooter,
  clickStatusIconNav,
  pageConfirmed,
  clickToObservatoryDataProductPage,
  clickAddDataProduct,
  clickAddDataProductEntry,
  selectOptionFromDropdown,
  verifyDataInTable,
  addContinuumImagesObservatoryDataProduct
} from '../../common/common.js';
import sensitivityCalculatorResults from '../../../fixtures/sensitivityCalculatorResults.json';
import { standardUser } from '../../users/users.js';
import { click } from '../../../fixtures/utils/cypress.js';

beforeEach(() => {
  cy.fixture('sensitivityCalculatorResults.json').as('sensitivityCalculatorResults');
  initialize(standardUser);
  mockOSDAPI();
  mockCreateProposalAPI();
  clickAddSubmission();
  cy.wait('@mockOSDData');
  clickCycleSelectionMockProposal();
  clickCycleConfirm();
  enterProposalTitle();
  clickProposalTypePrincipleInvestigator();
  clickSubProposalTypeTargetOfOpportunity();
  clickCreateSubmission();
  cy.wait('@mockCreateProposal');
  verifySubmissionCreatedAlertFooter();
  clickStatusIconNav('statusId4'); //Click to target page
  pageConfirmed('TARGET');
  addTargetUsingCoordinates();
  clickToAddTarget();
  clickToObservationPage();
});

afterEach(() => {
  clearLocalStorage();
});

const addTargetUsingCoordinates = () => {
  cy.get('[data-testid="name"]').should('exist');
  cy.get('[data-testid="name"]').type('test');
  cy.get('[data-testid="skyDirectionValue1"]').type('00:00:00.0');
  cy.get('[data-testid="skyDirectionValue2"]').type('00:00:00.0');
};

const verifySensitivityCalculatorStatusSuccess = () => {
  cy.get('[data-testid="statusId"]').should('exist');
  cy.get('[aria-label="Status : OK "]').should('exist');
};

const clickToViewSensitivityCalculatorResults = () => {
  cy.get('[data-testid="statusId"]').click();
};
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

const verifyIntegrationTime = rec => verifyField('integrationTimeLabel', rec.integrationTime);

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
  verifyIntegrationTime(rec);
};

describe('Proposal Flow: Sensitivity Calculator', () => {
  for (const rec of sensitivityCalculatorResults) {
    it('Proposal: Sensitivity calculator results : ' + rec.test, { jiraKey: 'XTP-71885' }, () => {
      clickObservationSetup();
      selectOptionFromDropdown('observingBand', rec.band);
      selectOptionFromDropdown('subArrayConfiguration', rec.subarray);
      selectOptionFromDropdown('observationType', rec.observationType);
      clickAddObservationEntry();
      verifyDataInTable('review-table', 'obs-');
      verifyDataInTable('review-table', 'AA2');

      clickStatusIconNav('statusId7'); //Click to data product page
      pageConfirmed('DATA PRODUCT');
      clickAddDataProduct();
      clickAddDataProductEntry();

      clickStatusIconNav('statusId8'); //Click to linking page
      pageConfirmed('LINKING');
      clickObservationFromTable();
      clickToLinkTargetAndObservation();
      verifySensitivityCalculatorStatusSuccess();

      clickToViewSensitivityCalculatorResults();
      verifySensitivityCalculatorResults(rec);
    });
  }
});
