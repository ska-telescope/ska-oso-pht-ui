// NOTE : use of underscore in field names is NOT to be used internally, that is a Python thing.

import Supplied from './supplied';

type Observation = {
  id: string;
  telescope: number;
  subarray: number;
  linked: string;
  type: number;
  observingBand: number;
  weather?: number; // only for MID
  elevation: number; // TODO should be only for Mid => what property for LOW?
  centralFrequency: number;
  centralFrequencyUnits: number;
  bandwidth: number; // only for zoom
  // bandwidthUnits: number; // only for zoom
  continuumBandwidth: number; // only for continuum
  continuumBandwidthUnits: number; // only for continuum
  spectralAveraging?: number; // only for LOW
  tapering?: number; // only for MID
  imageWeighting: number;
  robust: number;
  supplied: Supplied;
  spectralResolution: string;
  effectiveResolution: string;
  numSubBands?: number; // only for MID -> TODO should be for LOW too, PDM needs updating
  num15mAntennas?: number; // only for MID
  num13mAntennas?: number; // only for MID
  numStations?: number;
  details: string;
  // TODO: get right ascension + declination from target => store in target and send it as pointing_centre: '00:00:00.0 00:00:00.0',
};

export const NEW_OBSERVATION: Observation = {
  id: null,
  telescope: 0,
  subarray: 0,
  linked: '',
  type: 0,
  observingBand: 0,
  weather: 0,
  elevation: 15,
  centralFrequency: 0,
  centralFrequencyUnits: 0,
  bandwidth: 0,
  continuumBandwidth: 0,
  continuumBandwidthUnits: 0,
  spectralAveraging: 0,
  tapering: 0,
  imageWeighting: 0,
  robust: 3,
  supplied: {
    type: 0,
    value: 0,
    units: 0
  },
  spectralResolution: 'DUMMY',
  effectiveResolution: 'DUMMY',
  numSubBands: 0,
  num15mAntennas: 4,
  num13mAntennas: 0,
  numStations: 0,
  details: 'DUMMY'
};

export default Observation;
