// NOTE : use of underscore in field names is NOT to be used internally, that is a Python thing.

import Supplied from './supplied';

type Observation = {
  id: string;
  telescope: number;
  subarray: string;
  linked: string;
  type: string;
  observingBand: string;
  weather?: number; // only for MID
  elevation: number; // only for Mid
  centralFrequency: number;
  centralFrequencyUnits: number;
  bandwidth: number | null; // only for zoom
  // bandwidthUnits: number; // only for zoom
  continuumBandwidth: number | null; // only for continuum
  continuumBandwidthUnits: number | null; // only for continuum
  spectralAveraging?: number; // only for LOW
  supplied: Supplied;
  spectralResolution: string;
  effectiveResolution: string;
  numSubBands?: number; // only for MID
  num15mAntennas?: number; // only for MID
  num13mAntennas?: number; // only for MID
  numStations?: number;
  zoomChannels?: number; // only for zoom
  pstMode?: number; // only for pst
};

export default Observation;
