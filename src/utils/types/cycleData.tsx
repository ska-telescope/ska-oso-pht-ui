/*
export type CycleDataBackend = {
  cycle_description: string;
  cycle_information: { cycle_id: string; proposal_close: string; proposal_open: string };
  cycle_number: number;
  cycle_policies: { normal_max_hours: number };
  telescope_capabilities: { Low: string; Mid: string };
};

export default CycleDataBackend;
*/

export type ObservatoryPolicyBackend = {
  cycle_number: number;
  cycle_description: string;
  cycle_information: {
    cycle_id: string;
    proposal_open: string;
    proposal_close: string;
  };
  cycle_policies: {
    normal_max_hours: number;
  };
  telescope_capabilities: {
    Mid: string;
    Low: string;
  };
};

export type ReceiverInformationBackend = {
  rx_id: string;
  min_frequency_hz: number;
  max_frequency_hz: number;
};

export type BasicCapabilitiesBackend = {
  dish_elevation_limit_deg: number;
  receiver_information: ReceiverInformationBackend[];
};

export type subarrayConfigurationMidBackend = {
  available_receivers: string[];
  number_ska_dishes: number | null; // only for Mid
  number_meerkat_dishes: number | null; // only for Mid
  number_meerkatplus_dishes: number | null; // only for Mid
  number_channels: number | null; // only for Mid ?
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
};

export type subarrayConfigurationLowBackend = {
  number_stations: number;
  number_substations: number;
  number_beams: number;
  max_baseline_km: number;
  available_bandwidth_hz: number;
  cbf_modes: string[];
};

export type ObservatoryDataBackend = {
  observatory_policy: ObservatoryPolicyBackend;
  capabilities: {
    mid: {
      basic_capabilities: BasicCapabilitiesBackend;
      AA2: subarrayConfigurationMidBackend;
      low: {
        basic_capabilities: BasicCapabilitiesBackend;
        AA2: subarrayConfigurationLowBackend;
      };
    };
  };
};
