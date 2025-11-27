import {
  DEFAULT_CONTINUUM_OBSERVATION_LOW_AA2,
  DEFAULT_OBSERVATIONS_LOW_AA2,
  DEFAULT_PST_OBSERVATION_LOW_AA2,
  DEFAULT_ZOOM_OBSERVATION_LOW_AA2,
  TYPE_CONTINUUM,
  TYPE_PST,
  TYPE_ZOOM
} from '../constants';
import * as helpers from '../helpers';
import { calibrationOut, dataProductSDPOut } from './GenerateDefaultObservation';
import { mockCalibration } from './mockCalibration';
import { mockSDP } from './mockSDP';

describe('GenerateDefaultObservation, observationOut', () => {
  test('observationOut continuum', () => {
    expect(DEFAULT_OBSERVATIONS_LOW_AA2[TYPE_CONTINUUM]).equal(
      DEFAULT_CONTINUUM_OBSERVATION_LOW_AA2
    );
  });
  test('observationOut zoom', () => {
    expect(DEFAULT_OBSERVATIONS_LOW_AA2[TYPE_ZOOM]).equal(DEFAULT_ZOOM_OBSERVATION_LOW_AA2);
  });
  test('observationOut pst', () => {
    expect(DEFAULT_OBSERVATIONS_LOW_AA2[TYPE_PST]).equal(DEFAULT_PST_OBSERVATION_LOW_AA2);
  });
});

describe('GenerateDefaultObservation, dataProductSDPOut', () => {
  test('SDP default continuum', () => {
    vi.spyOn(helpers, 'generateId').mockReturnValue('SDP-0000000');
    const sdp = dataProductSDPOut('obs-123');
    expect(sdp).to.deep.equal(mockSDP);
  });
  // TODO add tests for other modes once implmented
});

describe('GenerateDefaultObservation, calibrationOut', () => {
  test('calibrationOut', () => {
    vi.spyOn(helpers, 'generateId').mockReturnValue('cal-0000000');
    const calibration = calibrationOut('obs-123');
    expect(calibration).to.deep.equal(mockCalibration);
  });
});
