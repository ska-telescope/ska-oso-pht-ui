// import axios from 'axios';
import axiosAuthClient from '@services/axios/axiosAuthClient/axiosAuthClient.tsx';
import { OSO_SERVICES_PROPOSAL_PATH, SKA_OSO_SERVICES_URL } from '@utils/constants.ts';

/*****************************************************************************************************************************/

const mapping = (response: {
  observatory_policy: {
    cycle_policies: { normal_max_hours: number };
    cycle_information: { proposal_close: string; cycle_id: string; proposal_open: string };
    cycle_description: string;
    telescope_capabilities: { Low: string; Mid: string };
    cycle_number: number;
  }
  capabilities: {
    low: { AA2: { available_bandwidth_hz: number; cbf_modes: [string]; channel_width_hz: number; max_baseline_km: number; number_beams:number; number_fsps: number; number_pss_beams: number; number_pst_beams: number; number_stations: number; number_substations: number; number_vlbi_beams: number; number_zoom_channels: number; number_zoom_windows: number; ps_beam_bandwidth_hz: number;}; basic_capabilities: { max_frequency_hz: number; min_frequency_hz: number; } };
    mid: { AA2: { available_bandwidth_hz: number; available_receivers: [string]; cbf_modes: [string]; max_baseline_km: number; number_channels: number; number_fsps: number; number_meerkat_dishes: number; number_meerkatplus_dishes: number; number_pss_beams: number; number_pst_beams: number; number_ska_dishes: number; number_zoom_channels: number;  number_zoom_windows: number; ps_beam_bandwidth_hz: number;}; basic_capabilities: { dish_elevation_limit_deg: number; receiver_information: [{rx_id: string, min_frequency_hz: number, max_frequency_hz: number}]}};
  }
}) => {
  console.log('check response ', response);
  if (response.observatory_policy) {
    console.log('observatory policy to be mapped ', response);
    console.log(response.capabilities.mid.basic_capabilities.receiver_information[1].rx_id)
    return (
      'cycle_number ' +
      response.observatory_policy.cycle_number +
      ' cycle_description ' +
      response.observatory_policy.cycle_description +
      ' cycle_id ' +
      response.observatory_policy.cycle_information.cycle_id +
      ' proposal_open ' +
      response.observatory_policy.cycle_information.proposal_open +
      ' proposal_close ' +
      response.observatory_policy.cycle_information.proposal_close +
      ' normal_max_hours ' +
      response.observatory_policy.cycle_policies.normal_max_hours +
      //Low telescope capabilities
      ' telescope_capabilities_low ' +
      response.observatory_policy.telescope_capabilities.Low +
      ' available_bandwidth_hz ' +
      response.capabilities.low.AA2.available_bandwidth_hz +
      ' cbf_modes ' +
      response.capabilities.low.AA2.cbf_modes +
      ' channel_width_hz ' +
      response.capabilities.low.AA2.channel_width_hz +
      ' max_baseline_km ' +
      response.capabilities.low.AA2.max_baseline_km +
      ' number_beams ' +
      response.capabilities.low.AA2.number_beams +
      ' number_fsps ' +
      response.capabilities.low.AA2.number_fsps +
      ' number_pss_beams ' +
      response.capabilities.low.AA2.number_pss_beams +
      ' number_pst_beams ' +
      response.capabilities.low.AA2.number_pst_beams +
      ' number_stations ' +
      response.capabilities.low.AA2.number_stations +
      ' number_substations ' +
      response.capabilities.low.AA2.number_substations +
      ' number_vlbi_beams ' +
      response.capabilities.low.AA2.number_vlbi_beams +
      ' number_zoom_channels ' +
      response.capabilities.low.AA2.number_zoom_channels +
      ' number_zoom_windows ' +
      response.capabilities.low.AA2.number_zoom_windows +
      ' ps_beam_bandwidth_hz ' +
      response.capabilities.low.AA2.ps_beam_bandwidth_hz +
      ' basic_capabilities max_frequency_hz ' +
      response.capabilities.low.basic_capabilities.max_frequency_hz +
      ' basic_capabilities min_frequency_hz ' +
      response.capabilities.low.basic_capabilities.min_frequency_hz +
      //Mid telescope capabilities
      ' telescope_capabilities_mid ' +
      response.observatory_policy.telescope_capabilities.Mid +
      ' available_bandwidth_hz ' +
      response.capabilities.mid.AA2.available_bandwidth_hz +
      ' available_receivers ' +
      response.capabilities.mid.AA2.available_receivers +
      ' cbf_modes ' +
      response.capabilities.mid.AA2.cbf_modes +
      ' max_baseline_km ' +
      response.capabilities.mid.AA2.max_baseline_km +
      ' number_channels ' +
      response.capabilities.mid.AA2.number_channels +
      ' number_fsps ' +
      response.capabilities.mid.AA2.number_fsps +
      ' number_meerkat_dishes ' +
      response.capabilities.mid.AA2.number_meerkat_dishes +
      ' number_meerkatplus_dishes ' +
      response.capabilities.mid.AA2.number_meerkatplus_dishes +
      ' number_pss_beams ' +
      response.capabilities.mid.AA2.number_pss_beams +
      ' number_pst_beams ' +
      response.capabilities.mid.AA2.number_pst_beams +
      ' number_ska_dishes ' +
      response.capabilities.mid.AA2.number_ska_dishes +
      ' number_zoom_channels ' +
      response.capabilities.mid.AA2.number_zoom_channels +
      ' number_zoom_windows ' +
      response.capabilities.mid.AA2.number_zoom_windows +
      ' ps_beam_bandwidth_hz ' +
      response.capabilities.mid.AA2.ps_beam_bandwidth_hz +
      ' dish_elevation_limit_deg ' +
      response.capabilities.mid.basic_capabilities.dish_elevation_limit_deg +
      //TODO: Reciever information
      ' receiver_information 1 rx_id ' +
      response.capabilities.mid.basic_capabilities.receiver_information[0].rx_id +
      ' receiver_information 1 min_frequency_hz ' +
      response.capabilities.mid.basic_capabilities.receiver_information[0].min_frequency_hz +
      ' receiver_information 1 max_frequency_hz ' +
      response.capabilities.mid.basic_capabilities.receiver_information[0].max_frequency_hz +
    );
  }
else {
    return { error: 'cycle.error' };
  }
};

async function GetCycleData(cycleNumber: number): Promise<string | { error: string }> {
  try {
    const URL_PATH = `/osd/`;
    const result = await axiosAuthClient.get(
      `${SKA_OSO_SERVICES_URL}${OSO_SERVICES_PROPOSAL_PATH}${URL_PATH}${cycleNumber}`
    );
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : mapping(result.data);
  } catch (e) {
    if (e instanceof Error) {
      return { error: e.message };
    }
    return { error: 'error.API_UNKNOWN_ERROR' };
  }
}

export default GetCycleData;
