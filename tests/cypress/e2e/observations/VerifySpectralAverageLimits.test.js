import {
  clearLocalStorage,
  clickObservationSetup,
  clickToGeneralPage,
  clickToObservationPage,
  clickToSciencePage,
  clickToTargetPage,
  createMock,
  createStandardProposal,
  initializeUserNotLoggedIn
} from '../common/common';
import {
  selectObservationTypeZoom,
  selectSubArrayAA1,
  selectSubArrayAA2,
  selectSubArrayAA2Core,
  selectSubArrayCustom,
  verifyContinuumSpectralAverageRangeAA1,
  verifyContinuumSpectralAverageRangeAA2,
  verifyContinuumSpectralAverageRangeAA4,
  verifyZoomSpectralAverageRangeAA2Core,
  verifyZoomSpectralAverageRangeCustom
} from './observations';

function commonConfiguration() {
  initializeUserNotLoggedIn();
  createMock();
  //navigate to observation page
  clickToObservationPage();
  //add default observation
  clickObservationSetup();
}

describe('Creating Observations, Verify spectral average limits, Continuum', () => {
  beforeEach(() => {
    commonConfiguration();
  });

  afterEach(() => {
    clearLocalStorage();
  });

  it('Verify Spectral average limits, Continuum Subarray AA4', { jiraKey: 'XTP-71407' }, () => {
    verifyContinuumSpectralAverageRangeAA4();
  });
  it('Verify Spectral average limits, Continuum Subarray AA2', { jiraKey: 'XTP-71407' }, () => {
    //switch to subarray AA2
    selectSubArrayAA2();
    verifyContinuumSpectralAverageRangeAA2();
  });

  it('Verify Spectral average limits, Continuum Subarray AA1', { jiraKey: 'XTP-71407' }, () => {
    //switch to subarray AA1
    selectSubArrayAA1();
    verifyContinuumSpectralAverageRangeAA1();
  });
});

//TODO: Resolve issue selecting subarray
describe('Creating Observations, Verify spectral average limits, Zoom ', () => {
  beforeEach(() => {
    commonConfiguration();
    // switch to Observation type Zoom
    selectObservationTypeZoom();
  });

  afterEach(() => {
    win.localStorage.clear();
  });

  it.skip(
    'Verify Spectral average limits, Zoom Subarray AA2 (Core only)',
    { jiraKey: 'XTP-71407' },
    () => {
      // switch to subarray AA2 Core
      selectSubArrayAA2Core();
      verifyZoomSpectralAverageRangeAA2Core();
    }
  );

  it.skip('Verify Spectral average limits, Zoom Subarray Custom', { jiraKey: 'XTP-71407' }, () => {
    // switch to subarray Custom
    selectSubArrayCustom();
    verifyZoomSpectralAverageRangeCustom();
  });
});
