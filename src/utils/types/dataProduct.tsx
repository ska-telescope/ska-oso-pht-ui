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
  fit_spectral_pol?: number;
  gaussian_taper?: string;
  kind: string;
  variant: string;
};

export type DataProductSDPContinuumVisibilitiesBackend = {
  image_size: ValueUnitPair;
  image_cellsize?: ValueUnitPair;
  weight: {
    weighting?: string;
    robust?: number;
  };
  polarisations: string[];
  channels_out?: number;
  fit_spectral_pol?: number;
  gaussian_taper?: string;
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
  fit_spectral_pol?: number;
  gaussian_taper?: string;
  continuum_subtraction?: boolean;
  kind: string;
  variant: string;
};

export type DataProductSDPPSTDetectedFilterBankBackend = {
  polarisations: string[];
  bit_depth: number;
  time_averaging_factor: number;
  frequency_averaging_factor: number;
  kind: string;
  variant: string;
};

export type DataProductSDPPSTTimingBackend = {
  polarisations: string[];
  bit_depth: number;
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

export type DataProductSRC = {
  id: string;
};
