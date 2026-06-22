// Backend types (model for data returned from /odt/configuration OSO services endpoint)

export type Band5bSubbandBackend = {
  sub_band: number;
  max_frequency_hz: number;
  min_frequency_hz: number;
  lo_frequency_hz: number;
  sideband: string;
};

export type MidFrequencyBandBackend = {
  rx_id: string;
  min_frequency_hz: number;
  max_frequency_hz: number;
  band5b_subbands: Band5bSubbandBackend[] | null;
};

export type LowFrequencyBandBackend = {
  min_frequency_hz: number;
  max_frequency_hz: number;
  min_coarse_channel: number;
  max_coarse_channel: number;
  coarse_channel_width_hz: number;
  number_continuum_channels_per_coarse_channel: number;
  number_zoom_channels_per_coarse_channel: number;
  number_pst_channels_per_coarse_channel: number;
  number_pss_channels_per_coarse_channel: number;
};

export type ConstraintsBackend = {
  sun_avoidance_angle_deg: number;
  moon_avoidance_angle_deg: number;
  jupiter_avoidance_angle_deg: number;
  min_elevation_deg: number;
  max_elevation_deg: number;
};

export type MidSubarrayBackend = {
  name: string;
  receptors: (string | number)[];
  available_bandwidth_hz: number;
  number_pst_beams: number;
  number_fsps: number;
  allowed_channel_width_values_hz: number[];
};

export type LowSubarrayBackend = {
  name: string;
  receptors: (string | number)[];
  available_bandwidth_hz: number;
  number_pst_beams: number;
  number_fsps: number;
  number_substations: number;
  number_subarray_beams: number;
};

export type ODTConfigurationBackend = {
  ska_mid: {
    frequency_band: MidFrequencyBandBackend[];
    constraints: ConstraintsBackend;
    subarrays: MidSubarrayBackend[];
  };
  ska_low: {
    frequency_band: LowFrequencyBandBackend;
    constraints: ConstraintsBackend;
    quality_attribute_metrics: { cbf: { processors_ready_percent: number } };
    subarrays: LowSubarrayBackend[];
  };
};
