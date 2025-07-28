// import axios from 'axios';
import { OSO_SERVICES_PROPOSAL_PATH, SKA_OSO_SERVICES_URL } from '@utils/constants.ts';
import useAxiosAuthClient from '@services/axios/axiosAuthClient/axiosAuthClient.tsx';
import { ObservatoryDataBackend, ObservatoryData } from '@/utils/types/observatoryData';

/*****************************************************************************************************************************/

const mapping = (inData: ObservatoryDataBackend): ObservatoryData => {
  return {
    observatoryPolicy: {
      cycleDescription: inData.observatory_policy.cycle_description,
      cycleNumber: inData.observatory_policy.cycle_number,
      cycleInformation: {
        cycleId: inData.observatory_policy.cycle_information.cycle_id,
        proposalOpen: inData.observatory_policy.cycle_information.proposal_open,
        proposalClose: inData.observatory_policy.cycle_information.proposal_close
      },
      cyclePolicies: { normalMaxHours: inData.observatory_policy.cycle_policies.normal_max_hours },
      telescopeCapabilities: {
        low: inData.observatory_policy.telescope_capabilities.Low,
        mid: inData.observatory_policy.telescope_capabilities.Mid
      }
    },
    capabilities: {
      mid: {
        basicCapabilities: {
          dishElevationLimitDeg:
            inData.capabilities.mid.basic_capabilities.dish_elevation_limit_deg,
          receiverInformation: inData.capabilities.mid.basic_capabilities.receiver_information.map(
            rx => ({
              rxId: rx.rx_id,
              minFrequencyHz: rx.min_frequency_hz,
              maxFrequencyHz: rx.max_frequency_hz
            })
          )
        },
        AA2: {
          availableReceivers: inData.capabilities.mid.AA2.available_receivers,
          numberSkaDishes: inData.capabilities.mid.AA2.number_ska_dishes,
          numberMeerkatDishes: inData.capabilities.mid.AA2.number_meerkat_dishes,
          numberMeerkatPlusDishes: inData.capabilities.mid.AA2.number_meerkatplus_dishes,
          numberChannels: inData.capabilities.mid.AA2.number_channels,
          numberStations: null,
          numberSubstations: null,
          maxBaselineKm: inData.capabilities.mid.AA2.max_baseline_km,
          availableBandwidthHz: inData.capabilities.mid.AA2.available_bandwidth_hz,
          cbfModes: inData.capabilities.mid.AA2.cbf_modes,
          numberZoomWindows: inData.capabilities.mid.AA2.number_zoom_windows,
          numberZoomChannels: inData.capabilities.mid.AA2.number_zoom_channels,
          numberPssBeams: inData.capabilities.mid.AA2.number_pss_beams,
          numberPstBeams: inData.capabilities.mid.AA2.number_pst_beams,
          psBeamBandwidthHz: inData.capabilities.mid.AA2.ps_beam_bandwidth_hz,
          numberFsps: inData.capabilities.mid.AA2.number_fsps,
          channelWidthHz: null,
          numberBeams: null,
          numberVlbiBeams: null
        }
      },
      low: {
        basicCapabilities: {
          minFrequencyHz: inData.capabilities.low.basic_capabilities.min_frequency_hz,
          maxFrequencyHz: inData.capabilities.low.basic_capabilities.max_frequency_hz
        },
        AA2: {
          availableReceivers: null,
          numberSkaDishes: null,
          numberMeerkatDishes: null,
          numberMeerkatPlusDishes: null,
          numberChannels: null,
          numberStations: null,
          numberSubstations: null,
          maxBaselineKm: inData.capabilities.low.AA2.max_baseline_km,
          availableBandwidthHz: inData.capabilities.low.AA2.available_bandwidth_hz,
          cbfModes: inData.capabilities.low.AA2.cbf_modes,
          numberZoomWindows: inData.capabilities.low.AA2.number_zoom_windows,
          numberZoomChannels: inData.capabilities.low.AA2.number_zoom_channels,
          numberPssBeams: inData.capabilities.low.AA2.number_pss_beams,
          numberPstBeams: inData.capabilities.low.AA2.number_pst_beams,
          psBeamBandwidthHz: inData.capabilities.low.AA2.ps_beam_bandwidth_hz,
          numberFsps: inData.capabilities.low.AA2.number_fsps,
          channelWidthHz: inData.capabilities.low.AA2.channel_width_hz,
          numberBeams: inData.capabilities.low.AA2.number_beams,
          numberVlbiBeams: inData.capabilities.low.AA2.number_vlbi_beams
        }
      }
    }
  };
};

async function GetCycleData(
  authAxiosClient: ReturnType<typeof useAxiosAuthClient>,
  cycleNumber: number
): Promise<string | ObservatoryData> {
  try {
    const URL_PATH = `/osd/`;
    const result = await authAxiosClient.get(
      `${SKA_OSO_SERVICES_URL}${OSO_SERVICES_PROPOSAL_PATH}${URL_PATH}${cycleNumber}`
    );
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : mapping(result.data);
  } catch (e) {
    if (e instanceof Error) {
      return e.message;
    }
    return 'error.API_UNKNOWN_ERROR';
  }
}

export default GetCycleData;
