export type WeightingQuery =
  | WeightingLowContinuumQuery
  | WeightingLowZoomQuery
  | WeightingLowSpectralQuery
  | WeightingMidContinuumQuery
  | WeightingMidZoomQuery
  | WeightingMidSpectralQuery;

export type WeightingLowContinuumQuery = {
  spectral_mode: string;
  weighting_mode: string;
  subarray_configuration: string;
  pointing_centre: string;
  freq_centre_mhz: number | string;
  robustness?: number | string;
};

export type WeightingLowZoomQuery = {
  weighting_mode: string;
  subarray_configuration: string;
  pointing_centre: string;
  freq_centres_mhz: number | string;
  robustness?: number | string;
};

export type WeightingLowSpectralQuery = {
  spectral_mode: string;
  weighting_mode: string;
  subarray_configuration: string;
  pointing_centre: string;
  freq_centre_mhz: number | string;
  robustness?: number | string;
};

export type WeightingMidContinuumQuery = {
  spectral_mode: string;
  freq_centre_hz: number | string;
  pointing_centre: string;
  weighting_mode: string;
  subarray_configuration: string;
  taper: number | string;
  robustness?: number | string;
};

export type WeightingMidZoomQuery = {
  freq_centres_hz: number | string;
  pointing_centre: string;
  weighting_mode: string;
  subarray_configuration: string;
  taper: number | string;
  robustness?: number | string;
};

export type WeightingMidSpectralQuery = {
  spectral_mode: string;
  freq_centre_hz: number | string;
  pointing_centre: string;
  weighting_mode: string;
  subarray_configuration: string;
  taper: number | string;
  robustness?: number | string;
};
