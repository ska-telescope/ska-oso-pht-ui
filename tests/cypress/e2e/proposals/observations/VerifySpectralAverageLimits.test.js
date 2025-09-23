import {
  clearLocalStorage,
  clickObservationSetup,
  clickToObservationPage,
  createMock,
  initializeUserNotLoggedIn
} from '../../common/common';
import {
  selectObservationTypeZoom,
  selectSubArrayCustom,
  verifyContinuumSpectralAverageRangeAA2,
  verifyZoomSpectralAverageRangeAA2,
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

  it('Verify Spectral average limits, Continuum Subarray AA2', { jiraKey: 'XTP-71407' }, () => {
    verifyContinuumSpectralAverageRangeAA2();
  });
});

describe('Creating Observations, Verify spectral average limits, Zoom ', () => {
  beforeEach(() => {
    commonConfiguration();
    // switch to Observation type Zoom
    selectObservationTypeZoom();
  });

  it('Verify Spectral average limits, Zoom Subarray AA2', { jiraKey: 'XTP-71407' }, () => {
    verifyZoomSpectralAverageRangeAA2();
  });

//TODO: Resolve issue selecting subarray
  it.skip('Verify Spectral average limits, Zoom Subarray Custom', { jiraKey: 'XTP-71407' }, () => {
    // switch to subarray Custom
    selectSubArrayCustom();
    verifyZoomSpectralAverageRangeCustom();
  });
});
