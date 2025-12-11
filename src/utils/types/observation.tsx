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
  bandwidth: number | null; // only for zoom
  // bandwidthUnits: number; // only for zoom
  continuumBandwidth: number | null; // only for continuum
  continuumBandwidthUnits: number | null; // only for continuum
  spectralAveraging?: number; // only for LOW
  supplied: Supplied;
  spectralResolution: string;
  effectiveResolution: string;
  numSubBands?: number; // only for MID -> TODO should be for LOW too, PDM needs updating
  num15mAntennas?: number; // only for MID
  num13mAntennas?: number; // only for MID
  numStations?: number;
  zoomChannels?: number; // only for zoom
  pstMode?: number; // only for pst
};

export default Observation;
