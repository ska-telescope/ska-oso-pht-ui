export type CalculateMidContinuumQuery = {
  integration_time_s?: number | string;
  sensitivity_jy?: number | string;
  rx_band: string;
  subarray_configuration: string;
  freq_centre_hz: number | string;
  bandwidth_hz: number | string;
  spectral_averaging_factor: number | string;
  pointing_centre: string;
  pwv: number | string;
  el: number | string;
  n_subbands: number | string;
};

export type CalculateMidZoomQuery = {
  integration_time_s?: number | string;
  sensitivity_jy?: number | string;
  rx_band: string;
  subarray_configuration: string;
  freq_centres_hz: number | string;
  pointing_centre: string;
  pwv: number | string;
  el: number | string;
  spectral_resolutions_hz: number | string;
  total_bandwidths_hz: number | string;
};

export type CalculateLowContinuumQuery = {
  integration_time_h: number | string;
  pointing_centre: string;
  elevation_limit: number | string;
  freq_centre_mhz: number | string;
  spectral_averaging_factor: number | string;
  bandwidth_mhz: number | string;
  n_subbands: number | string;
  subarray_configuration?: string;
  num_stations?: number;
};

export type CalculateLowZoomQuery = {
  integration_time_h: number | string;
  pointing_centre: string;
  elevation_limit: number | string;
  freq_centres_mhz: number | string;
  spectral_averaging_factor: number | string;
  spectral_resolutions_hz: number | string;
  total_bandwidths_khz: number | string;
  subarray_configuration?: string;
  num_stations?: number;
};
