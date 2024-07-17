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
  continuumBandwidth: number; // only for continuum
  continuumBandwidthUnits: number; // only for continuum
  spectralAveraging?: number; // only for LOW
  tapering?: string; // only for MID
  imageWeighting: number;
  integrationTime: number;
  integrationTimeUnits: number;
  supplied: Supplied;
  spectralResolution: string;
  effectiveResolution: string;
  numSubBands?: number; // only for MID
  num15mAntennas?: number; // only for MID
  num13mAntennas?: number; // only for MID
  numStations?: number;
  details: string;
  // TODO: get right ascension + declination from target => store in target and send it as pointing_centre: '00:00:00.0 00:00:00.0',
};

export const NEW_OBSERVATION: Observation = {
  id: 'DUMMY-ID',
  telescope: 0,
  subarray: 0,
  linked: '',
  type: 0,
  observingBand: 0,
  weather: 0,
  elevation: 0,
  centralFrequency: 0,
  centralFrequencyUnits: 0,
  bandwidth: 0,
  continuumBandwidth: 0,
  continuumBandwidthUnits: 0,
  spectralAveraging: 0,
  tapering: 'DUMMY',
  imageWeighting: 0,
  integrationTime: 0,
  integrationTimeUnits: 0,
  supplied: {
    type: 0,
    value: 0,
    units: 0,
  },
  spectralResolution: 'DUMMY',
  effectiveResolution: 'DUMMY',
  numSubBands: 0,
  num15mAntennas: 0,
  num13mAntennas: 0,
  numStations: 0,
  details: 'DUMMY'
};

export default Observation;
