import { ValueUnitPair } from './valueUnitPair';

export type DataProductSDPContinuumImageBackend = {
  image_size: ValueUnitPair;
  image_cellsize?: ValueUnitPair;
  weight: {
    weighting?: string;
    robust?: number;
  };
  polarisations: string[];
  channels_out?: number;
  gaussian_taper?: string;
  kind: string;
  variant: string;
};

export type DataProductSDPContinuumVisibilitiesBackend = {
  time_averaging: ValueUnitPair;
  frequency_averaging: ValueUnitPair;
  kind: string;
  variant: string;
};

export type DataProductSDPSpectralImageBackend = {
  image_size: ValueUnitPair;
  image_cellsize?: ValueUnitPair;
  weight: {
    weighting?: string;
    robust?: number;
  };
  polarisations: string[];
  channels_out?: number;
  gaussian_taper?: string;
  continuum_subtraction?: boolean;
  kind: string;
  variant: string;
};

export type DataProductSDPPSTDetectedFilterBankBackend = {
  polarisations: string[];
  bit_depth: number;
  time_averaging_factor: number;
  output_sampling_interval: number;
  dispersion_measure: number;
  rotation_measure: number;
  kind: string;
  variant: string;
};

export type DataProductSDPPSTTimingBackend = {
  kind: string;
  variant: string;
};

export type DataProductSDPPSTFlowthroughBackend = {
  polarisations: string[];
  bit_depth: number;
  kind: string;
  variant: string;
};

export type DataProductSDPsBackend = {
  data_product_id: string;
  observation_set_ref: string;
  script_parameters:
    | DataProductSDPContinuumImageBackend
    | DataProductSDPContinuumVisibilitiesBackend
    | DataProductSDPSpectralImageBackend
    | DataProductSDPPSTDetectedFilterBankBackend
    | DataProductSDPPSTTimingBackend
    | DataProductSDPPSTFlowthroughBackend;
};

export type DataProductSRCNetBackend = {
  data_products_src_id: string;
};

// TODO remove this type when once SDP types for Proposal flow updated as DataProductSDPNew should be used instead
// (LinkingPage.tsx)
export type DataProductSDP = {
  id: string;
  dataProductType: number;
  observationId: string;
  imageSizeValue: number;
  imageSizeUnits: number;
  pixelSizeValue: number;
  pixelSizeUnits: number;
  weighting: number;
  robust: number;
  polarisations: string[];
  channelsOut: number;
  taperValue: number;
  fitSpectralPol: number;
  timeAveraging: number;
  frequencyAveraging: number;
  bitDepth: number;
  continuumSubtraction: boolean;
};

export type DataProductSDPNew = {
  id: string;
  observationId: string;
  data:
    | SDPImageContinuumData
    | SDPVisibilitiesContinuumData
    | SDPSpectralData
    | SDPFilterbankPSTData
    | SDPTimingPSTData
    | SDPFlowthroughPSTData;
};

// 6 modes
export type SDPImageContinuumData = {
  dataProductType: number;
  imageSizeValue: number;
  imageSizeUnits: number;
  pixelSizeValue: number;
  pixelSizeUnits: number;
  weighting: number;
  robust: number;
  taperValue: number;
  channelsOut: number;
  polarisations: string[];
};

export type SDPVisibilitiesContinuumData = {
  dataProductType: number;
  timeAveraging: number;
  frequencyAveraging: number;
};

export type SDPSpectralData = {
  imageSizeValue: number;
  imageSizeUnits: number;
  pixelSizeValue: number;
  pixelSizeUnits: number;
  weighting: number;
  robust: number;
  taperValue: number;
  channelsOut: number;
  polarisations: string[];
  continuumSubtraction: boolean;
};

export type SDPFlowthroughPSTData = {
  dataProductType: number;
  polarisations: string[];
  bitDepth: number;
};

export type SDPTimingPSTData = {
  dataProductType: number;
};

export type SDPFilterbankPSTData = {
  dataProductType: number;
  bitDepth: number;
  polarisations: string[];
  outputFrequencyResolution: number;
  outputSamplingInterval: number;
  dispersionMeasure: number;
  rotationMeasure: number;
};

export type DataProductSRC = {
  id: string; // base
  dataProductType: number; // base
  observationId: string; // base
};
