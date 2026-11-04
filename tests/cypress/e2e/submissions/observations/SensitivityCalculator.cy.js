import {
  enterTargetField,
  clickObservationFromTable,
  clickObservationSetup,
  clickToAddTarget,
  clickToLinkTargetAndObservation,
  clickToObservationPage,
  clickAddObservationEntry,
  clearLocalStorage,
  clickStatusIconNav,
  pageConfirmed,
  clickAddDataProduct,
  clickAddDataProductEntry,
  selectOptionFromDropdown,
  verifyDataInTable,
  createStandardProposalSession
} from '../../../support/common.js';
import sensitivityCalculatorResults from '../../../fixtures/sensitivityCalculatorResults.json';
import { standardUser } from '../../../support/users.js';

const addTargetUsingCoordinates = () => {
  enterTargetField('Name', 'test');
  enterTargetField('Right Ascension', '00:00:00.0');
  enterTargetField('Declination', '00:00:00.0');
};

// The sensitivity calculator's status icon is labelled with its status
const sensitivityCalculatorStatus = () => cy.get('[aria-label="Status : OK "]');

const verifySensitivityCalculatorStatusSuccess = () => {
  sensitivityCalculatorStatus().should('exist');
};

const clickToViewSensitivityCalculatorResults = () => {
  sensitivityCalculatorStatus().click();
};
const verifyField = (id, value) => {
  if (value !== '') {
    cy.get('[id="' + id + '"]').should('contain', value);
  }
};

const verifyWeightedContinuumSensitivity = (rec) =>
  verifyField('continuumSensitivityWeightedLabel', rec.weightedContinuumSensitivity);

const verifyContinuumConfusionNoise = (rec) =>
  verifyField('continuumConfusionNoiseLabel', rec.continuumConfusionNoise);

const verifyTotalContinuumSensitivity = (rec) =>
  verifyField('continuumTotalSensitivityLabel', rec.totalContinuumSensitivity);

const verifyContinuumSurfaceBrightnessSensitivity = (rec) =>
  verifyField(
    'continuumSurfaceBrightnessSensitivityLabel',
    rec.continuumSurfaceBrightnessSensitivity
  );

const verifyWeightedSpectralSensitivity = (rec) =>
  verifyField('spectralSensitivityWeightedLabel', rec.weightedSpectralSensitivity);

const verifySpectralConfusionNoise = (rec) =>
  verifyField('spectralConfusionNoiseLabel', rec.spectralConfusionNoise);

const verifyTotalSpectralSensitivity = (rec) =>
  verifyField('spectralTotalSensitivityLabel', rec.totalSpectralSensitivity);

const verifySpectralSynthesizedBeamSize = (rec) =>
  verifyField('spectralSynthBeamSizeLabel', rec.spectralSynthesizedBeamSize);

const verifySpectralSurfaceBrightnessSensitivity = (rec) =>
  verifyField(
    'spectralSurfaceBrightnessSensitivityLabel',
    rec.spectralSurfaceBrightnessSensitivity
  );

const verifyIntegrationTime = (rec) => verifyField('integrationTimeLabel', rec.integrationTime);

const verifySensitivityCalculatorResults = (rec) => {
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

// No standard/PI-proposal cycle exists in the real backend yet (only a Science Verification one
// is seeded) - stub-only until one is, this isn't a test-code fix. Remove this skip (and verify
// it) at that point rather than rewriting this spec from scratch.
//
// Skipped via describe.skip() (not this.skip() inside a function(){} beforeEach) - see
// reviewScience.cy.js's comment: a function(){...this.skip()} test/hook sharing a spec with
// cy.intercept().as() elsewhere (here, createStandardProposalSession's own mockOSDAPI/
// mockCreateProposalAPI) reliably corrupts Cypress's command tracking. describe.skip() never
// invokes any of its hooks or tests at all, so it sidesteps that entirely.
describe.skip('Proposal Flow: Sensitivity Calculator', () => {
  beforeEach(() => {
    cy.fixture('sensitivityCalculatorResults.json').as('sensitivityCalculatorResults');
    createStandardProposalSession(standardUser);
    clickStatusIconNav('Target');
    pageConfirmed('TARGET');
    addTargetUsingCoordinates();
    clickToAddTarget();
    clickToObservationPage();
  });

  afterEach(() => {
    clearLocalStorage();
  });

  for (const rec of sensitivityCalculatorResults) {
    // TODO: getOSDCycles.tsx's mapCycle() currently hardcodes MID cycles to only ever expose
    // Band_5b as an observing-band option - so skip the MID tests for now until we can fix that.
    const runTest = rec.band.includes('Mid') ? it.skip : it;
    runTest(
      'Proposal: Sensitivity calculator results : ' + rec.test,
      { jiraKey: 'XTP-71885' },
      () => {
        clickObservationSetup();
        selectOptionFromDropdown('Band', rec.band);
        selectOptionFromDropdown('Subarray Configuration', rec.subarray);
        selectOptionFromDropdown('Observing Mode', rec.observationType);
        clickAddObservationEntry();
        verifyDataInTable('obs-');
        verifyDataInTable(rec.subarrayTableLabel);

        clickStatusIconNav('Data Product');
        pageConfirmed('DATA PRODUCT');
        clickAddDataProduct();
        clickAddDataProductEntry();

        clickStatusIconNav('Linking');
        pageConfirmed('LINKING');
        clickObservationFromTable();
        clickToLinkTargetAndObservation();
        verifySensitivityCalculatorStatusSuccess();

        clickToViewSensitivityCalculatorResults();
        verifySensitivityCalculatorResults(rec);
      }
    );
  }
});
