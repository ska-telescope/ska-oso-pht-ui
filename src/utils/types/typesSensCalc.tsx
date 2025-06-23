import {
  BAND_1,
  DEFAULT_EQUATORIAL,
  DEFAULT_GALACTIC,
  DEFAULT_LOW_SUPPLIED_INTEGRATION_TIME,
  DEFAULT_LOW_SUPPLIED_SENSITIVITY,
  DEFAULT_MID_SUPPLIED_INTEGRATION_TIME,
  DEFAULT_MID_SUPPLIED_SENSITIVITY,
  FREQUENCY_GHZ,
  FREQUENCY_MHZ,
  RA_TYPE_EQUATORIAL,
  RA_TYPE_GALACTIC,
  TYPE_CONTINUUM,
  TYPE_PSS,
  TYPE_ZOOM
} from '../constantsSensCalc';

export type Telescope = {
  code: string;
  name: string;
  location: string;
  position: {
    lat: number;
    lon: number;
  };
  image: string;
};

export type Mid = {
  name: string;
  label: string;
  n_ska: number;
  n_meer: number;
};

export type Low = {
  name: string;
  label: string;
  n_stations: number;
};

export type SubArrayResults = (Low | Mid)[];

export type ValueUnitPair = {
  value: number;
  unit: string;
};

export type StringUnitPair = {
  value: string;
  unit: string;
};

export type AdvancedData = {
  efficiencySystemState: boolean;
  efficiencySystem: number;
  efficiencyState: boolean;
  efficiencyPointing: number;
  efficiencyCoherence: number;
  efficiencyDigitisation: number;
  efficiencyCorrelation: number;
  efficiencyBandpass: number;
  //
  efficiencyAperture15: number;
  efficiencyAperture13: number;
  //
  temperature15SystemState: boolean;
  temperature15System: number;
  temperature15State: boolean;
  temperature15Receiver: number;
  temperature15Spillover: number;
  //
  temperature13SystemState: boolean;
  temperature13System: number;
  temperature13State: boolean;
  temperature13Receiver: number;
  temperature13Spillover: number;
  //
  skyBrightnessTemperatureState: boolean;
  skyBrightnessTemperature: number;
  //
  skyBrightnessGalacticState: boolean;
  skyBrightnessGalactic: number;
  //
  skyBrightnessSpectralIndexState: boolean;
  skyBrightnessSpectralIndex: number;
};

export const NEW_ADVANCED_DATA = {
  efficiencySystemState: true,
  efficiencySystem: 0.1,
  efficiencyState: false,
  efficiencyPointing: 0,
  efficiencyCoherence: 0.1,
  efficiencyDigitisation: 0.1,
  efficiencyCorrelation: 0.1,
  efficiencyBandpass: 0.1,
  //
  efficiencyAperture15: 0.1,
  efficiencyAperture13: 0.1,
  //
  temperature15SystemState: true,
  temperature15System: 0.1,
  temperature15State: false,
  temperature15Receiver: 0.1,
  temperature15Spillover: 0.1,
  //
  temperature13SystemState: true,
  temperature13System: 0.1,
  temperature13State: false,
  temperature13Receiver: 0.1,
  temperature13Spillover: 0.1,
  //
  skyBrightnessTemperatureState: false,
  skyBrightnessTemperature: 0,
  //
  skyBrightnessGalacticState: false,
  skyBrightnessGalactic: 0,
  //
  skyBrightnessSpectralIndexState: false,
  skyBrightnessSpectralIndex: 0
};

export type ZoomData = {
  dataType: number;
  bandwidth: ValueUnitPair;
  suppliedType: number;
  supplied_0: ValueUnitPair;
  supplied_1: ValueUnitPair;
  centralFrequency: ValueUnitPair;
  spectralAveraging: number;
  spectralResolution: string;
  imageWeighting: number;
  robust: number;
  tapering: number;
};

export const NEW_ZOOM_DATA_LOW: ZoomData = {
  dataType: TYPE_ZOOM,
  bandwidth: { value: 1, unit: '2' },
  suppliedType: 0,
  supplied_0: DEFAULT_LOW_SUPPLIED_INTEGRATION_TIME,
  supplied_1: DEFAULT_LOW_SUPPLIED_SENSITIVITY,
  centralFrequency: { value: 200, unit: '2' },
  spectralAveraging: 1,
  spectralResolution: '',
  imageWeighting: 1,
  robust: 3,
  tapering: 0
};

export const NEW_ZOOM_DATA_MID: ZoomData = {
  dataType: TYPE_ZOOM,
  bandwidth: { value: 1, unit: '1' },
  suppliedType: 0,
  supplied_0: DEFAULT_MID_SUPPLIED_INTEGRATION_TIME,
  supplied_1: DEFAULT_MID_SUPPLIED_SENSITIVITY,
  centralFrequency: { value: 0.7975, unit: '1' },
  spectralAveraging: 1,
  spectralResolution: '',
  imageWeighting: 1,
  robust: 3,
  tapering: 0
};

export type ContinuumData = {
  dataType: number;
  bandwidth: ValueUnitPair;
  effectiveResolution: string;
  suppliedType: number;
  supplied_0: ValueUnitPair;
  supplied_1: ValueUnitPair;
  centralFrequency: ValueUnitPair;
  numberOfSubBands: number;
  spectralAveraging: number;
  imageWeighting: number;
  robust: number;
  tapering: number;
};

export const NEW_CONTINUUM_DATA_LOW: ContinuumData = {
  dataType: TYPE_CONTINUUM,
  bandwidth: { value: 300, unit: '2' },
  effectiveResolution: '',
  suppliedType: 0,
  supplied_0: DEFAULT_LOW_SUPPLIED_INTEGRATION_TIME,
  supplied_1: DEFAULT_LOW_SUPPLIED_SENSITIVITY,
  centralFrequency: { value: 200, unit: '2' },
  numberOfSubBands: 1,
  spectralAveraging: 1,
  imageWeighting: 1,
  robust: 3,
  tapering: 0
};

export const NEW_CONTINUUM_DATA_MID: ContinuumData = {
  dataType: TYPE_CONTINUUM,
  bandwidth: { value: 0.435, unit: '1' },
  effectiveResolution: '',
  suppliedType: 0,
  supplied_0: DEFAULT_MID_SUPPLIED_INTEGRATION_TIME,
  supplied_1: DEFAULT_MID_SUPPLIED_SENSITIVITY,
  centralFrequency: { value: 0.7975, unit: '1' },
  numberOfSubBands: 1,
  spectralAveraging: 1,
  imageWeighting: 1,
  robust: 3,
  tapering: 0
};

export type PSSData = {
  dataType: number;
  pulsarMode: string;
  pulsePeriod: ValueUnitPair;
  pulseWidth: ValueUnitPair;
  suppliedType: number;
  supplied_0: ValueUnitPair;
  supplied_1: ValueUnitPair;
  centralFrequency: ValueUnitPair;
  bandwidth: ValueUnitPair;
  channelWidth: ValueUnitPair;
  dispersion: ValueUnitPair;
  alpha: number;
};

export const NEW_PSS_DATA_LOW = {
  dataType: TYPE_PSS,
  pulsarMode: 'folded_pulse',
  pulsePeriod: { value: 33, unit: 'ms' },
  pulseWidth: { value: 0.004, unit: 'ms' },
  suppliedType: 0,
  supplied_0: DEFAULT_LOW_SUPPLIED_INTEGRATION_TIME,
  supplied_1: DEFAULT_LOW_SUPPLIED_SENSITIVITY,
  centralFrequency: { value: 200, unit: FREQUENCY_MHZ.toString() },
  bandwidth: { value: 118.52, unit: FREQUENCY_MHZ.toString() },
  channelWidth: { value: 14.5, unit: '3' },
  dispersion: { value: 14, unit: 'pc/cm3' },
  alpha: 2.75
};

export const NEW_PSS_DATA_MID = {
  dataType: TYPE_PSS,
  pulsarMode: 'folded_pulse',
  pulsePeriod: { value: 33, unit: 'ms' },
  pulseWidth: { value: 0.004, unit: 'ms' },
  suppliedType: 0,
  supplied_0: DEFAULT_MID_SUPPLIED_INTEGRATION_TIME,
  supplied_1: DEFAULT_MID_SUPPLIED_SENSITIVITY,
  centralFrequency: { value: 0.7975, unit: FREQUENCY_GHZ.toString() },
  bandwidth: { value: 300, unit: FREQUENCY_MHZ.toString() },
  channelWidth: { value: 14.5, unit: '3' },
  dispersion: { value: 14, unit: 'pc/cm3' },
  alpha: 2.75
};

export type StandardData = {
  observingBand: string;
  weather: ValueUnitPair;
  subarray: string;
  num15mAntennas: number;
  num13mAntennas: number;
  numStations: number;
  skyDirectionType: string;
  raGalactic: StringUnitPair;
  decGalactic: StringUnitPair;
  raEquatorial: ValueUnitPair;
  decEquatorial: ValueUnitPair;
  elevation: ValueUnitPair;
  advancedData: AdvancedData | null;
  modules: (ContinuumData | ZoomData | PSSData)[];
};

export const NEW_STANDARD_DATA_LOW = {
  observingBand: '',
  weather: { value: 10, unit: 'mm' },
  subarray: 'LOW_AA4_all',
  num15mAntennas: 133,
  num13mAntennas: 64,
  numStations: 512,
  skyDirectionType: RA_TYPE_GALACTIC,
  raGalactic: { value: DEFAULT_GALACTIC, unit: RA_TYPE_GALACTIC },
  decGalactic: { value: DEFAULT_GALACTIC, unit: RA_TYPE_GALACTIC },
  raEquatorial: { value: DEFAULT_EQUATORIAL, unit: RA_TYPE_EQUATORIAL },
  decEquatorial: { value: DEFAULT_EQUATORIAL, unit: RA_TYPE_EQUATORIAL },
  elevation: { value: 20, unit: 'deg' },
  advancedData: NEW_ADVANCED_DATA,
  modules: [NEW_CONTINUUM_DATA_LOW, NEW_ZOOM_DATA_LOW, NEW_PSS_DATA_LOW]
};

export const NEW_STANDARD_DATA_MID = {
  observingBand: BAND_1,
  weather: { value: 10, unit: 'mm' },
  subarray: 'MID_AA4_all',
  num15mAntennas: 133,
  num13mAntennas: 64,
  numStations: 512,
  skyDirectionType: RA_TYPE_GALACTIC,
  raGalactic: { value: DEFAULT_GALACTIC, unit: RA_TYPE_GALACTIC },
  decGalactic: { value: DEFAULT_GALACTIC, unit: RA_TYPE_GALACTIC },
  raEquatorial: { value: DEFAULT_EQUATORIAL, unit: RA_TYPE_EQUATORIAL },
  decEquatorial: { value: DEFAULT_EQUATORIAL, unit: RA_TYPE_EQUATORIAL },
  elevation: { value: 45, unit: 'deg' },
  advancedData: NEW_ADVANCED_DATA,
  modules: [NEW_CONTINUUM_DATA_MID, NEW_ZOOM_DATA_MID, NEW_PSS_DATA_MID]
};
