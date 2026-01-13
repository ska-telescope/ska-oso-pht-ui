// import axios from 'axios';
import {
  SA_AA2,
  SA_AA_STAR,
  OSO_SERVICES_PROPOSAL_PATH,
  SKA_OSO_SERVICES_URL,
  USE_LOCAL_DATA,
  BAND_LOW_STR,
  BAND_5B_STR,
  BAND_1_STR,
  BAND_2_STR,
  BAND_3_STR,
  BAND_4_STR,
  BAND_5A_STR
} from '@utils/constants.ts';
import useAxiosAuthClient from '@services/axios/axiosAuthClient/axiosAuthClient.tsx';
import { MockObservatoryDataBackend } from './mockObservatoryDataBackend';
import { ObservatoryDataBackend, ObservatoryData } from '@/utils/types/observatoryData';

/*****************************************************************************************************************************/

export function GetMockData(mock = MockObservatoryDataBackend): ObservatoryData {
  return mapping(mock);
}

export const toLowerCaseArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];

  return value.filter(item => typeof item === 'string').map(item => item.toLowerCase());
};

const mapping = (inData: ObservatoryDataBackend): ObservatoryData => {
  //
  //  If/when the API provides multiple cycles, this section will need to be updated to map all cycles
  //
  return {
    policies: [
      {
        cycleNumber: inData.observatory_policy.cycle_number,
        cycleDescription: inData.observatory_policy.cycle_description,
        cycleInformation: {
          cycleId: inData.observatory_policy.cycle_information.cycle_id,
          proposalOpen: inData.observatory_policy.cycle_information.proposal_open,
          proposalClose: inData.observatory_policy.cycle_information.proposal_close
        },
        cyclePolicies: {
          maxDataProducts: inData.observatory_policy.cycle_policies.max_data_products,
          maxObservations: inData.observatory_policy.cycle_policies.max_observation_setups,
          maxTargets: inData.observatory_policy.cycle_policies.max_targets,
          bands: [
            inData?.observatory_policy?.telescope_capabilities?.Low !== null ? BAND_LOW_STR : '',
            inData?.observatory_policy?.telescope_capabilities?.Mid !== null ? BAND_5B_STR : '' // TODO: Update when more bands are available
          ].filter(band => band !== ''),
          low: toLowerCaseArray(inData?.observatory_policy?.telescope_capabilities?.Low),
          mid: toLowerCaseArray(inData?.observatory_policy?.telescope_capabilities?.Mid)
        },
        telescopeCapabilities: {
          low: inData?.observatory_policy?.telescope_capabilities?.Low,
          mid: inData?.observatory_policy?.telescope_capabilities?.Mid
        },
        type: inData.observatory_policy.type
      },
      {
        cycleNumber: 2,
        cycleDescription: 'Mid AA2 Science Verification',
        cycleInformation: {
          cycleId: 'CYCLE-002',
          proposalOpen: '2025-04-01',
          proposalClose: '2026-06-01'
        },
        cyclePolicies: {
          maxDataProducts: 1,
          maxObservations: 1,
          maxTargets: 1,
          bands: [BAND_5B_STR],
          low: [],
          mid: [SA_AA2]
        },
        telescopeCapabilities: {
          low: null,
          mid: null
        },
        type: 'Science Verification'
      },
      {
        cycleNumber: 3,
        cycleDescription: 'Mock Proposal Cycle',
        cycleInformation: {
          cycleId: 'CYCLE-003',
          proposalOpen: '2025-07-01',
          proposalClose: '2026-09-01'
        },
        cyclePolicies: {
          maxDataProducts: 100,
          maxObservations: 100,
          maxTargets: 100,
          bands: [BAND_LOW_STR, BAND_1_STR],
          low: [SA_AA2, SA_AA_STAR],
          mid: [SA_AA2, SA_AA_STAR]
        },
        telescopeCapabilities: {
          low: null,
          mid: null
        },
        type: 'Proposal'
      },
      {
        cycleNumber: 4,
        cycleDescription: 'Fourth mock cycle',
        cycleInformation: {
          cycleId: 'CYCLE-004',
          proposalOpen: '2025-10-01',
          proposalClose: '2025-12-01'
        },
        cyclePolicies: {
          maxDataProducts: 100,
          maxObservations: 100,
          maxTargets: 100,
          bands: [BAND_LOW_STR, 'mid'],
          low: [SA_AA2],
          mid: [SA_AA2]
        },
        telescopeCapabilities: {
          low: null,
          mid: null
        },
        type: 'Proposal'
      }
    ],
    capabilities: {
      mid: {
        basicCapabilities: {
          dishElevationLimitDeg: 15, //            inData.capabilities.mid.basic_capabilities.dish_elevation_limit_deg,
          // receiverInformation: inData.capabilities.mid.basic_capabilities.receiver_information.map(
          //   rx => ({
          //     rxId: rx.rx_id,
          //     minFrequencyHz: rx.min_frequency_hz,
          //     maxFrequencyHz: rx.max_frequency_hz,
          //     subBands: rx.sub_bands
          //   })
          // )
          receiverInformation: [
            {
              rxId: BAND_1_STR,
              minFrequencyHz: 350000000,
              maxFrequencyHz: 1050000000
            },
            {
              rxId: BAND_2_STR,
              minFrequencyHz: 950000000,
              maxFrequencyHz: 1760000000
            },
            {
              rxId: BAND_3_STR,
              minFrequencyHz: 1650000000,
              maxFrequencyHz: 3050000000
            },
            {
              rxId: BAND_4_STR,
              minFrequencyHz: 2800000000,
              maxFrequencyHz: 5180000000
            },
            {
              rxId: BAND_5A_STR,
              minFrequencyHz: 4600000000,
              maxFrequencyHz: 8500000000
            },
            {
              rxId: BAND_5B_STR,
              minFrequencyHz: 11450000000,
              maxFrequencyHz: 13510000000,
              subBands: [
                {
                  subBand: 1,
                  maxFrequencyHz: 12150000000,
                  minFrequencyHz: 11450000000,
                  loFrequencyHz: 11100000000,
                  sideband: 'high'
                },
                {
                  subBand: 2,
                  maxFrequencyHz: 13510000000,
                  minFrequencyHz: 12810000000,
                  loFrequencyHz: 13860000000,
                  sideband: 'low'
                },
                {
                  subBand: 3,
                  maxFrequencyHz: 12850000000,
                  minFrequencyHz: 12150000000,
                  loFrequencyHz: 11100000000,
                  sideband: 'high'
                }
              ]
            }
          ]
        },
        subArrays: [
          {
            subArray: SA_AA2,
            allowedChannelCountRangeMax: [214748647],
            allowedChannelCountRangeMin: [1],
            allowedChannelWidthValues: [
              210,
              420,
              840,
              1680,
              3360,
              6720,
              13440,
              26880,
              40320,
              53760,
              80640,
              107520,
              161280,
              215040,
              322560,
              416640,
              430080,
              645120
            ],
            availableReceivers: [BAND_1_STR],
            numberSkaDishes: 64,
            numberMeerkatDishes: 20,
            numberMeerkatPlusDishes: 0,
            maxBaselineKm: 110,
            availableBandwidthHz: 80000000,
            numberChannels: null,
            cbfModes: ['correlation', 'pst', 'pss'],
            numberZoomWindows: 17,
            numberZoomChannels: 14880,
            numberPssBeams: 385,
            numberPstBeams: 6,
            psBeamBandwidthHz: 800000000,
            numberFsps: 35
          },
          {
            subArray: SA_AA_STAR,
            allowedChannelCountRangeMax: [214748647],
            allowedChannelCountRangeMin: [1],
            allowedChannelWidthValues: [
              210,
              420,
              840,
              1680,
              3360,
              6720,
              13440,
              26880,
              40320,
              53760,
              80640,
              107520,
              161280,
              215040,
              322560,
              416640,
              430080,
              645120
            ],
            availableReceivers: [BAND_1_STR],
            numberSkaDishes: 64,
            numberMeerkatDishes: 20,
            numberMeerkatPlusDishes: 0,
            maxBaselineKm: 110,
            availableBandwidthHz: 80000000,
            numberChannels: null,
            cbfModes: ['correlation', 'pst', 'pss'],
            numberZoomWindows: 17,
            numberZoomChannels: 14880,
            numberPssBeams: 385,
            numberPstBeams: 6,
            psBeamBandwidthHz: 800000000,
            numberFsps: 35
          }
        ]
      },
      low: inData?.capabilities?.low?.basic_capabilities
        ? {
            basicCapabilities: {
              minFrequencyHz: inData.capabilities.low.basic_capabilities.min_frequency_hz,
              maxFrequencyHz: inData.capabilities.low.basic_capabilities.max_frequency_hz
            },
            subArrays: [
              {
                subArray: SA_AA2,
                numberStations: inData.capabilities.low.AA2.number_stations,
                numberSubstations: inData.capabilities.low.AA2.number_substations,
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
              },
              {
                subArray: SA_AA_STAR,
                numberStations: inData.capabilities.low.AA2.number_stations,
                numberSubstations: inData.capabilities.low.AA2.number_substations,
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
            ]
          }
        : null
    }
  };
};

async function GetObservatoryData(
  authAxiosClient: ReturnType<typeof useAxiosAuthClient>,
  cycleNumber: number
): Promise<string | ObservatoryData> {
  if (USE_LOCAL_DATA) {
    return GetMockData();
  }

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

export default GetObservatoryData;
