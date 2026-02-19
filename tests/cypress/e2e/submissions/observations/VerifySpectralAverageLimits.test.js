import {
  clearLocalStorage,
  clickObservationSetup,
  clickToObservationPage,
  createMock,
  initializeUserNotLoggedIn
} from '../../common/common.js';
import {
  selectObservationTypeZoom,
  selectSubArrayCustom,
  verifyContinuumSpectralAverageRangeAA2,
  verifyZoomSpectralAverageRangeAA2,
  verifyZoomSpectralAverageRangeCustom
} from './observations.js';

function commonConfiguration() {
  initializeUserNotLoggedIn();
  createMock();
  //navigate to observation page
  clickToObservationPage();
  //add default observation
  clickObservationSetup();
}
// TODO Scenario needs to be re-defined based on a non-logged in user flow - see STAR-1904
describe('Creating Observations, Verify spectral average limits, Continuum', () => {
  beforeEach(() => {
    commonConfiguration();
  });

  afterEach(() => {
    clearLocalStorage();
  });

  //TODO: Skipped as spectral average field is currently suppressed
  it.skip(
    'Verify Spectral average limits, Continuum Subarray AA2',
    { jiraKey: 'XTP-71407' },
    () => {
      verifyContinuumSpectralAverageRangeAA2();
    }
  );
});

// TODO Scenario needs to be re-defined based on a non-logged in user flow - see STAR-1904
describe('Creating Observations, Verify spectral average limits, Zoom ', () => {
  beforeEach(() => {
    commonConfiguration();
    // switch to Observation type Zoom
    selectObservationTypeZoom();
  });

  //TODO: Skipped as spectral average field is currently suppressed
  it.skip('Verify Spectral average limits, Zoom Subarray AA2', { jiraKey: 'XTP-71407' }, () => {
    verifyZoomSpectralAverageRangeAA2();
  });

  //TODO: Resolve issue selecting subarray
  it.skip('Verify Spectral average limits, Zoom Subarray Custom', { jiraKey: 'XTP-71407' }, () => {
    // switch to subarray Custom
    selectSubArrayCustom();
    verifyZoomSpectralAverageRangeCustom();
  });
});
