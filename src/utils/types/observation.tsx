// NOTE : use of underscore in field names is NOT to be used intternally, that is a Python thing.

type Observation = {
  id: string;
  telescope: number;
  subarray: number;
  linked: string;
  type: number;
  observingBand: number;
  weather?: number; // only for MID
  elevation: number;
  centralFrequency: string;
  bandwidth: number; // only for zoom
  continuumBandwidth: string; // only for continuum
  spectralAveraging?: number; // only for LOW
  tapering?: string; // only for MID
  imageWeighting: number;
  integrationTime: number;
  integrationTimeUnits: number;
  spectralResolution: string;
  effectiveResolution: string;
  numSubBands?: number; // only for MID
  num15mAntennas?: number;
  num13mAntennas?: number;
  numStations?: number;
  details: string;
  // TODO: get right ascension + declination from target => store in target and send it as pointing_centre: '00:00:00.0 00:00:00.0',
};

export default Observation;
