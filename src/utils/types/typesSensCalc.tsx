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
