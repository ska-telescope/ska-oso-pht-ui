import { ValueUnitPair } from "./valueUnitPair";

export type CalculateResponseLow = {
  freq_centre?: ValueUnitPair;
  continuum_sensitivity?: ValueUnitPair;
  spectral_sensitivity?:ValueUnitPair;
  spectropolarimetry_results?: ValueUnitPair;
  max_faraday_depth_extent?: ValueUnitPair;
  max_faraday_depth?: ValueUnitPair;
};

export type CalculateResponseMid = {
  continuum_sensitivity?: ValueUnitPair;
  spectral_sensitivity?: ValueUnitPair;
  continuum_integration_time?: ValueUnitPair;
  spectral_integration_time?: ValueUnitPair;
};

export type WeightingResponse = {
  beam_size: {
    beam_maj_scaled: number;
    beam_min_scaled: number;
    beam_pa: number;
  };
  confusion_noise: {
    value: number;
    limit_type: string;
  };
  sbs_conv_factor: number;
  weighting_factor: number;
};

export type SensitivityCalculatorAPIResponseLow = {
  calculate: {
    data: CalculateResponseLow;
  };
  weighting: WeightingResponse;
  weightingLine: WeightingResponse;
};

export type SensitivityCalculatorAPIResponseMid = {
  calculate: {
    data: CalculateResponseMid;
    // status: number;
  };
  calculateSpectral?: {
    data: CalculateResponseMid;
    // status: number;
  };
  weighting: WeightingResponse;
  weightingLine: WeightingResponse;
};
