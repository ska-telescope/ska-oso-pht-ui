import {
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
  verifyContinuumSpectralAverageRangeAA4,
  verifyZoomSpectralAverageRangeAA2Core,
  verifyZoomSpectralAverageRangeCustom
} from './observations';

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

describe('XTP-71407 Creating Observations', () => {
  it('Verify Spectral average limits', () => {
    //verify spectral average limits
    verifyContinuumSpectralAverageRangeAA4();
    verifyContinuumSpectralAverageRangeAA2();
    verifyContinuumSpectralAverageRangeAA1();
    verifyZoomSpectralAverageRangeAA2Core();
    verifyZoomSpectralAverageRangeCustom();
  });
});
