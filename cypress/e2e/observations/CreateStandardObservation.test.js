import {
  clickAddObservation,
  clickObservationSetup,
  clickToGeneralPage,
  clickToObservationPage,
  clickToSciencePage,
  clickToTargetPage,
  createStandardProposal,
  initialize
} from '../common/common';
import {
  verifyContinuumSpectralAverageRangeAA1,
  verifyContinuumSpectralAverageRangeAA2,
  verifyContinuumSpectralAverageRangeAA4, verifyZoomSpectralAverageRangeAA2Core, verifyZoomSpectralAverageRangeCustom
} from './observations.js';
beforeEach(() => {
  initialize();
  createStandardProposal();
  //navigate to observation page
  clickToGeneralPage();
  clickToSciencePage();
  clickToTargetPage();
  clickToObservationPage();
  //add default observation
  clickObservationSetup();
});

const verifyUnlinkedObservationInTable = () => {
  cy.get('div[role="presentation"].MuiDataGrid-virtualScrollerContent > div[role="rowgroup"]')
    .children('div[role="row"]')
    .should('contain', 'obs-')
    .should('contain', 'AA4')
    .should('have.length', 1);
};

describe('XTP-71407 Create Observations', () => {
  it('Create a default observation', () => {
    clickAddObservation();
    verifyUnlinkedObservationInTable();
  });

  it('Verify Spectral average limits', () => {
    //verify spectral average limits
    verifyContinuumSpectralAverageRangeAA4();
    verifyContinuumSpectralAverageRangeAA2();
    verifyContinuumSpectralAverageRangeAA1();
    verifyZoomSpectralAverageRangeAA2Core();
    verifyZoomSpectralAverageRangeCustom();
  });
});
