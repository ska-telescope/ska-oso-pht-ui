export type ObservatoryPolicyBackend = {
  cycle_number: number;
  cycle_description: string;
  cycle_information: CycleInformationBackend;
  cycle_policies: {
    max_data_products: number;
    max_observation_setups: number;
    max_targets: number;
    normal_max_hours: number;
  };
  telescope_capabilities: TelescopeInformationBackend;
  type: string;
};

export type ObservatoryPolicy = {
  cycleNumber: number;
  cycleDescription: string;
  cycleInformation: CycleInformationFrontend;
  cyclePolicies: {
    maxDataProducts: number;
    maxObservations: number;
    maxTargets: number;
    bands: string[];
    low: string[];
    mid: string[];
  };
  telescopeCapabilities: TelescopeInformationFrontend;
  type: string;
};

export type ReceiverInformationBackend = {
  rx_id: string;
  min_frequency_hz: number;
  max_frequency_hz: number;
};

export type ReceiverInformationFrontend = {
  rxId: string;
  minFrequencyHz: number;
  maxFrequencyHz: number;
};

export type TelescopeInformationBackend = {
  Mid: string;
  Low: string;
};

export type TelescopeInformationFrontend = {
  mid: string | null;
  low: string | null;
};

export type CycleInformationBackend = {
  cycle_id: string;
  proposal_open: string;
  proposal_close: string;
};

export type CycleInformationFrontend = {
  cycleId: string;
  proposalOpen: string;
  proposalClose: string;
};

export type BasicCapabilitiesMidBackend = {
  dish_elevation_limit_deg: number;
  receiver_information: ReceiverInformationBackend[];
};

export type BasicCapabilitiesMid = {
  dishElevationLimitDeg: number;
  receiverInformation: ReceiverInformationFrontend[];
};

export type BasicCapabilitiesLowBackend = {
  min_frequency_hz: number;
  max_frequency_hz: number;
};

export type BasicCapabilitiesLow = {
  minFrequencyHz: number;
  maxFrequencyHz: number;
};

export type subarrayConfigurationMidBackend = {
  available_receivers: string[];
  number_ska_dishes: number | null;
  number_meerkat_dishes: number | null;
  number_meerkatplus_dishes: number | null;
  number_channels: number | null;
  max_baseline_km: number;
  available_bandwidth_hz: number;
  cbf_modes: string[];
  number_zoom_windows: number;
  number_zoom_channels: number;
  number_pss_beams: number;
  number_pst_beams: number;
  ps_beam_bandwidth_hz: number;
  number_fsps: number;
};

export type subarrayConfigurationMid = {
  subArray: string;
  availableReceivers: string[];
  numberSkaDishes: number | null;
  numberMeerkatDishes: number | null;
  numberMeerkatPlusDishes: number | null;
  numberChannels: number | null;
  maxBaselineKm: number;
  availableBandwidthHz: number;
  cbfModes: string[];
  numberZoomWindows: number;
  numberZoomChannels: number;
  numberPssBeams: number;
  numberPstBeams: number;
  psBeamBandwidthHz: number;
  numberFsps: number;
};

export type subarrayConfigurationLowBackend = {
  number_stations: number | null;
  number_substations: number | null;
  max_baseline_km: number;
  available_bandwidth_hz: number;
  cbf_modes: string[];
  number_zoom_windows: number;
  number_zoom_channels: number;
  number_pss_beams: number;
  number_pst_beams: number;
  ps_beam_bandwidth_hz: number;
  number_fsps: number;
  channel_width_hz: number | null;
  number_beams: number | null;
  number_vlbi_beams: number | null;
};

export type subarrayConfigurationLow = {
  subArray: string;
  numberStations: number | null;
  numberSubstations: number | null;
  maxBaselineKm: number;
  availableBandwidthHz: number;
  cbfModes: string[];
  numberZoomWindows: number;
  numberZoomChannels: number;
  numberPssBeams: number;
  numberPstBeams: number;
  psBeamBandwidthHz: number;
  numberFsps: number;
  channelWidthHz: number | null;
  numberBeams: number | null;
  numberVlbiBeams: number | null;
};

export type ObservatoryDataBackend = {
  observatory_policy: ObservatoryPolicyBackend;
  capabilities: {
    mid: {
      basic_capabilities: BasicCapabilitiesMidBackend;
      AA2: subarrayConfigurationMidBackend;
    };
    low: {
      basic_capabilities: BasicCapabilitiesLowBackend;
      AA2: subarrayConfigurationLowBackend;
    };
  };
};

export type ObservatoryData = {
  policies: ObservatoryPolicy[];
  capabilities: {
    mid: {
      basicCapabilities: BasicCapabilitiesMid;
      subArrays: subarrayConfigurationMid[];
    } | null;
    low: {
      basicCapabilities: BasicCapabilitiesLow;
      subArrays: subarrayConfigurationLow[];
    } | null;
  };
};

export default ObservatoryData;
