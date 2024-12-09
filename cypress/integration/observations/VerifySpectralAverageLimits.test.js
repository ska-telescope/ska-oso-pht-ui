import {
  clickObservationSetup,
  clickToGeneralPage,
  clickToObservationPage,
  clickToSciencePage,
  clickToTargetPage,
  createStandardProposal
} from '../common/common';
import {
  verifyContinuumSpectralAverageRangeAA1,
  verifyContinuumSpectralAverageRangeAA2,
  verifyContinuumSpectralAverageRangeAA4,
  verifyZoomSpectralAverageRangeAA2Core,
  verifyZoomSpectralAverageRangeCustom
} from './observations';

beforeEach(() => {
  createStandardProposal();
});

describe('Creating Observations', () => {
  it('Verify Spectral average limits', { jiraKey: 'XTP-71407' }, () => {
    //navigate to observation page
    clickToGeneralPage();
    clickToSciencePage();
    clickToTargetPage();
    clickToObservationPage();
    //add default observation
    clickObservationSetup();
    //verify spectral average limits
    verifyContinuumSpectralAverageRangeAA4();
    verifyContinuumSpectralAverageRangeAA2();
    verifyContinuumSpectralAverageRangeAA1();
    verifyZoomSpectralAverageRangeAA2Core();
    verifyZoomSpectralAverageRangeCustom();
  });
});
