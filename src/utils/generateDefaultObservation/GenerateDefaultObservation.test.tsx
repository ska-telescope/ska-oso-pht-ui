import {
  DEFAULT_CONTINUUM_OBSERVATION_LOW_AA2,
  DEFAULT_DATA_PRODUCT_CONTINUUM,
  DEFAULT_DATA_PRODUCT_PST,
  DEFAULT_DATA_PRODUCT_SPECTRAL,
  DEFAULT_PST_OBSERVATION_LOW_AA2,
  DEFAULT_ZOOM_OBSERVATION_LOW_AA2,
  TYPE_CONTINUUM,
  TYPE_PST,
  TYPE_ZOOM
} from '../constants';
import * as helpers from '../helpers';
import { calibrationOut, dataProductSDPOut, observationOut } from './GenerateDefaultObservation';
import { mockCalibration } from './mockCalibration';

describe('GenerateDefaultObservation, observationOut', () => {
  test('observationOut continuum', () => {
    expect(observationOut(TYPE_CONTINUUM)).equal(DEFAULT_CONTINUUM_OBSERVATION_LOW_AA2);
  });
  test('observationOut zoom', () => {
    expect(observationOut(TYPE_ZOOM)).equal(DEFAULT_ZOOM_OBSERVATION_LOW_AA2);
  });
  test('observationOut pst', () => {
    expect(observationOut(TYPE_PST)).equal(DEFAULT_PST_OBSERVATION_LOW_AA2);
  });
});

describe('GenerateDefaultObservation, dataProductSDPOut', () => {
  test('SDP default continuum', () => {
    vi.spyOn(helpers, 'generateId').mockReturnValue('SDP-0000000');
    const sdp = dataProductSDPOut('obs-123', TYPE_CONTINUUM);
    expect(sdp).to.deep.equal(DEFAULT_DATA_PRODUCT_CONTINUUM);
  });
  test('SDP default spectral', () => {
    vi.spyOn(helpers, 'generateId').mockReturnValue('SDP-0000000');
    const sdp = dataProductSDPOut('obs-123', TYPE_ZOOM);
    expect(sdp).to.deep.equal(DEFAULT_DATA_PRODUCT_SPECTRAL);
  });
  test('SDP default PST', () => {
    vi.spyOn(helpers, 'generateId').mockReturnValue('SDP-0000000');
    const sdp = dataProductSDPOut('obs-123', TYPE_PST);
    expect(sdp).to.deep.equal(DEFAULT_DATA_PRODUCT_PST);
  });
});

describe('GenerateDefaultObservation, calibrationOut', () => {
  test('calibrationOut', () => {
    vi.spyOn(helpers, 'generateId').mockReturnValue('cal-0000000');
    const calibration = calibrationOut('obs-123');
    expect(calibration).to.deep.equal(mockCalibration);
  });
});
