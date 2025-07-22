export type ObservatoryPolicyBackend = {
  cycle_number: number;
  cycle_description: string;
  cycle_information: CycleInformationBackend;
  cycle_policies: {
    normal_max_hours: number;
  };
  telescope_capabilities: TelescopeInformationBackend;
};

export type ObservatoryPolicy = {
  cycleNumber: number;
  cycleDescription: string;
  cycleInformation: CycleInformationFrontend;
  cyclePolicies: {
    normalMaxHours: number;
  };
  telescopeCapabilities: TelescopeInformationFrontend;
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
  mid: string;
  low: string;
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
  available_receivers: string[]; // only for Mid
  number_ska_dishes: number | null; // only for Mid
  number_meerkat_dishes: number | null; // only for Mid
  number_meerkatplus_dishes: number | null; // only for Mid
  number_channels: number | null; // only for Mid
  number_stations: number | null; // only for Low
  number_substations: number | null; // only for Low
  max_baseline_km: number;
  available_bandwidth_hz: number;
  cbf_modes: string[];
  number_zoom_windows: number;
  number_zoom_channels: number;
  number_pss_beams: number;
  number_pst_beams: number;
  ps_beam_bandwidth_hz: number;
  number_fsps: number;
  channel_width_hz: number | null; // only for Low
  number_beams: number | null; // only for Low
  number_vlbi_beams: number | null; // only for Low
};

export type subarrayConfigurationMid = {
  availableReceivers: string[]; // only for Mid
  numberSkaDishes: number | null; // only for Mid
  numberMeerkatDishes: number | null; // only for Mid
  numberMeerkatPlusDishes: number | null; // only for Mid
  numberChannels: number | null; // only for Mid
  numberStations: number | null; // only for Low
  numberSubstations: number | null; // only for Low
  maxBaselineKm: number;
  availableBandwidthHz: number;
  cbfModes: string[];
  numberZoomWindows: number;
  numberZoomChannels: number;
  numberPssBeams: number;
  numberPstBeams: number;
  psBeamBandwidthHz: number;
  numberFsps: number;
  channelWidthHz: number | null; // only for Low
  numberBeams: number | null; // only for Low
  numberVlbiBeams: number | null; // only for Low
};

export type subarrayConfigurationLowBackend = {
  available_receivers: string[]; // only for Mid
  number_ska_dishes: number | null; // only for Mid
  number_meerkat_dishes: number | null; // only for Mid
  number_meerkatplus_dishes: number | null; // only for Mid
  number_channels: number | null; // only for Mid
  number_stations: number | null; // only for Low
  number_substations: number | null; // only for Low
  max_baseline_km: number;
  available_bandwidth_hz: number;
  cbf_modes: string[];
  number_zoom_windows: number;
  number_zoom_channels: number;
  number_pss_beams: number;
  number_pst_beams: number;
  ps_beam_bandwidth_hz: number;
  number_fsps: number;
  channel_width_hz: number | null; // only for Low
  number_beams: number | null; // only for Low
  number_vlbi_beams: number | null; // only for Low
};

export type subarrayConfigurationLow = {
  availableReceivers: string[] | null; // only for Mid
  numberSkaDishes: number | null; // only for Mid
  numberMeerkatDishes: number | null; // only for Mid
  numberMeerkatPlusDishes: number | null; // only for Mid
  numberChannels: number | null; // only for Mid
  numberStations: number | null; // only for Low
  numberSubstations: number | null; // only for Low
  maxBaselineKm: number;
  availableBandwidthHz: number;
  cbfModes: string[];
  numberZoomWindows: number;
  numberZoomChannels: number;
  numberPssBeams: number;
  numberPstBeams: number;
  psBeamBandwidthHz: number;
  numberFsps: number;
  channelWidthHz: number | null; // only for Low
  numberBeams: number | null; // only for Low
  numberVlbiBeams: number | null; // only for Low
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
  observatoryPolicy: ObservatoryPolicy;
  capabilities: {
    mid: {
      basicCapabilities: BasicCapabilitiesMid;
      AA2: subarrayConfigurationMid;
    };
    low: {
      basicCapabilities: BasicCapabilitiesLow;
      AA2: subarrayConfigurationLow;
    };
  };
};

export default ObservatoryData;
