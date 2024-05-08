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
  bandwidth: number;
  spectralAveraging?: number; // only for LOW
  tapering?: number; // only for MID
  imageWeighting: number;
  integrationTime: string;
  integrationTimeUnits: number;
  // continuumBandwidth?: number; // used where? => same as bandwidth
  spectralResolution: string;
  effectiveResolution: number;
  numSubBands?: number; // only for MID
  num15mAntennas?: number;
  num13mAntennas?: number;
  numStations?: number;
  details: string;
  // TODO: get right ascension + declination from target => store in target and send it as pointing_centre: '00:00:00.0 00:00:00.0',
};

export default Observation;
