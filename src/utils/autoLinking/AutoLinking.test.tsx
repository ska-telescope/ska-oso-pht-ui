import {
  DEFAULT_CONTINUUM_OBSERVATION_LOW_AA2,
  DEFAULT_DATA_PRODUCT,
  DEFAULT_PST_OBSERVATION_LOW_AA2,
  DEFAULT_ZOOM_OBSERVATION_LOW_AA2,
  TYPE_CONTINUUM,
  TYPE_PST,
  TYPE_ZOOM
} from '../constants';
import * as helpers from '../helpers';
import { calibrationOut, dataProductSDPOut, observationOut } from './AutoLinking.';
import { mockCalibration } from './mockCalibration';
import { PST_DATA_PRODUCT } from './mockSDP';

describe('autoLinking, observationOut', () => {
  test('observationOut continuum', () => {
    vi.spyOn(helpers, 'generateId').mockReturnValue('obs-0000000');
    expect(observationOut(TYPE_CONTINUUM)).deep.equal(DEFAULT_CONTINUUM_OBSERVATION_LOW_AA2);
  });
  test('observationOut zoom', () => {
    vi.spyOn(helpers, 'generateId').mockReturnValue('obs-0000000');
    expect(observationOut(TYPE_ZOOM)).deep.equal(DEFAULT_ZOOM_OBSERVATION_LOW_AA2);
  });
  test('observationOut pst', () => {
    vi.spyOn(helpers, 'generateId').mockReturnValue('obs-0000000');
    expect(observationOut(TYPE_PST)).deep.equal(DEFAULT_PST_OBSERVATION_LOW_AA2);
  });
});

describe('autoLinking, dataProductSDPOut', () => {
  test('SDP default continuum', () => {
    vi.spyOn(helpers, 'generateId').mockReturnValue('SDP-0000000');
    const sdp = dataProductSDPOut('obs-123', TYPE_CONTINUUM);
    expect(sdp).to.deep.equal(DEFAULT_DATA_PRODUCT);
  });
  test('SDP default spectral', () => {
    vi.spyOn(helpers, 'generateId').mockReturnValue('SDP-0000000');
    const sdp = dataProductSDPOut('obs-123', TYPE_ZOOM);
    expect(sdp).to.deep.equal(DEFAULT_DATA_PRODUCT);
  });
  test('SDP default PST', () => {
    vi.spyOn(helpers, 'generateId').mockReturnValue('SDP-0000000');
    const sdp = dataProductSDPOut('obs-123', TYPE_PST);
    expect(sdp).to.deep.equal(PST_DATA_PRODUCT);
  });
});

describe('autoLinking, calibrationOut', () => {
  test('calibrationOut', () => {
    vi.spyOn(helpers, 'generateId').mockReturnValue('cal-0000000');
    const calibration = calibrationOut('obs-123');
    expect(calibration).to.deep.equal(mockCalibration);
  });
});

// describe('autoLinking, autoLinking function', () => {
//  // TODO: Add tests for autoLinking function
// });
