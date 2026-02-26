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
import {
  ObservatoryDataBackend,
  ObservatoryData,
  ObservatoryPolicy
} from '@/utils/types/observatoryData';
import { capabilities } from 'happy-dom/lib/PropertySymbol';

/*****************************************************************************************************************************/

export function GetMockData(mock = MockObservatoryDataBackend): ObservatoryData {
  return mapping(mock);
}

export const toLowerCaseArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];

  return value.filter(item => typeof item === 'string').map(item => item.toLowerCase());
};

const mapping = (inData: ObservatoryDataBackend[]): ObservatoryData => {
  //
  //  If/when the API provides multiple cycles, this section will need to be updated to map all cycles
  //

  console.log('mapping inData', inData);

  const mapCycle = (inc: ObservatoryDataBackend): ObservatoryPolicy => {
    return {
      cycleNumber: inc.observatory_policy.cycle_number,
      cycleDescription: inc.observatory_policy.cycle_description,
      cycleInformation: {
        cycleId: inc.observatory_policy.cycle_information.cycle_id,
        proposalOpen: inc.observatory_policy.cycle_information.proposal_open,
        proposalClose: inc.observatory_policy.cycle_information.proposal_close
      },
      cyclePolicies: {
        maxDataProducts: inc.observatory_policy.cycle_policies.max_data_products,
        maxObservations: inc.observatory_policy.cycle_policies.max_observation_setups,
        maxTargets: inc.observatory_policy.cycle_policies.max_targets,
        calibrationFactoryDefined: true,
        bands: [
          inc?.observatory_policy?.telescope_capabilities?.Low !== null ? BAND_LOW_STR : '',
          inc?.observatory_policy?.telescope_capabilities?.Mid !== null ? BAND_5B_STR : '' // Update when more bands are available
        ].filter(band => band !== ''),
        low: toLowerCaseArray(inc?.observatory_policy?.telescope_capabilities?.Low),
        mid: toLowerCaseArray(inc?.observatory_policy?.telescope_capabilities?.Mid)
      },
      telescopeCapabilities: {
        low: inc?.observatory_policy?.telescope_capabilities?.Low,
        mid: inc?.observatory_policy?.telescope_capabilities?.Mid
      },
      type: inc.observatory_policy.type
    };
  };

  console.log('now try');

  const policies = {
    policies: inData.map(cycle => mapCycle(cycle))
  };

  console.log('policies', policies);

  // TODO map subbands
  // const mapSubBands = (data): any[] => {

  // }

  const mapCapabilities = (inData: ObservatoryDataBackend): ObservatoryData['capabilities'] => {
    console.log('mapCapabilities inData', inData);
    return {
      mid: {
        basicCapabilities: {
          dishElevationLimitDeg:
            inData?.capabilities?.mid?.basic_capabilities?.dish_elevation_limit_deg,
          // NOTE: Should allow looping of data when API supports it
          //            inData.capabilities.mid.basic_capabilities.dish_elevation_limit_deg,
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
              rxId: inData?.capabilities?.mid?.basic_capabilities?.receiver_information[0]?.rx_id,
              minFrequencyHz:
                inData?.capabilities?.mid?.basic_capabilities?.receiver_information[0]
                  ?.min_frequency_hz,
              maxFrequencyHz:
                inData?.capabilities?.mid?.basic_capabilities?.receiver_information[0]
                  ?.max_frequency_hz
            },
            {
              rxId: inData?.capabilities?.mid?.basic_capabilities?.receiver_information[1]?.rx_id,
              minFrequencyHz:
                inData?.capabilities?.mid?.basic_capabilities?.receiver_information[1]
                  ?.min_frequency_hz,
              maxFrequencyHz:
                inData?.capabilities?.mid?.basic_capabilities?.receiver_information[1]
                  ?.max_frequency_hz
            },
            {
              rxId: inData?.capabilities?.mid?.basic_capabilities?.receiver_information[2]?.rx_id,
              minFrequencyHz:
                inData?.capabilities?.mid?.basic_capabilities?.receiver_information[2]
                  ?.min_frequency_hz,
              maxFrequencyHz:
                inData?.capabilities?.mid?.basic_capabilities?.receiver_information[2]
                  ?.max_frequency_hz
            },
            {
              rxId: inData?.capabilities?.mid?.basic_capabilities?.receiver_information[3]?.rx_id,
              minFrequencyHz:
                inData?.capabilities?.mid?.basic_capabilities?.receiver_information[3]
                  ?.min_frequency_hz,
              maxFrequencyHz:
                inData?.capabilities?.mid?.basic_capabilities?.receiver_information[3]
                  ?.max_frequency_hz
            },
            {
              rxId: inData?.capabilities?.mid?.basic_capabilities?.receiver_information[4]?.rx_id,
              minFrequencyHz:
                inData?.capabilities?.mid?.basic_capabilities?.receiver_information[4]
                  ?.min_frequency_hz,
              maxFrequencyHz:
                inData?.capabilities?.mid?.basic_capabilities?.receiver_information[4]
                  ?.max_frequency_hz
            },
            {
              rxId: inData?.capabilities?.mid?.basic_capabilities?.receiver_information[5]?.rx_id,
              minFrequencyHz:
                inData?.capabilities?.mid?.basic_capabilities?.receiver_information[5]
                  ?.min_frequency_hz,
              maxFrequencyHz:
                inData?.capabilities?.mid?.basic_capabilities?.receiver_information[5]
                  ?.max_frequency_hz,
              // suBands: inData?.capabilities?.mid?.basic_capabilities?.receiver_information[5]?.sub_bands ? mapSubBands() : null,
              subBands: [
                {
                  subBand:
                    inData?.capabilities?.mid?.basic_capabilities?.receiver_information[5]
                      ?.sub_bands[0]?.sub_band,
                  maxFrequencyHz:
                    inData?.capabilities?.mid?.basic_capabilities?.receiver_information[5]
                      ?.sub_bands[0]?.max_frequency_hz,
                  minFrequencyHz:
                    inData?.capabilities?.mid?.basic_capabilities?.receiver_information[5]
                      ?.sub_bands[0]?.min_frequency_hz,
                  loFrequencyHz:
                    inData?.capabilities?.mid?.basic_capabilities?.receiver_information[5]
                      ?.sub_bands[0]?.lo_frequency_hz,
                  sideband:
                    inData?.capabilities?.mid?.basic_capabilities?.receiver_information[5]
                      ?.sub_bands[0]?.sideband
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
    };
  };

  const capabilities = {
    capabilities: inData.map(cycle => mapCapabilities(cycle))
  };

  console.log('test', inData[0].capabilities.mid.basic_capabilities.dish_elevation_limit_deg);
  console.log('capabilities', capabilities);

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
          calibrationFactoryDefined: true,
          bands: [
            inData?.observatory_policy?.telescope_capabilities?.Low !== null ? BAND_LOW_STR : '',
            inData?.observatory_policy?.telescope_capabilities?.Mid !== null ? BAND_5B_STR : '' // Update when more bands are available
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
          calibrationFactoryDefined: true,
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
          calibrationFactoryDefined: true,
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
          calibrationFactoryDefined: true,
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
          dishElevationLimitDeg: 15,
          // NOTE: Should allow looping of data when API supports it
          //            inData.capabilities.mid.basic_capabilities.dish_elevation_limit_deg,
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

async function GetOSDCycles(
  authAxiosClient: ReturnType<typeof useAxiosAuthClient>
): Promise<string | ObservatoryData> {
  if (USE_LOCAL_DATA) {
    return GetMockData();
  }

  try {
    const URL_PATH = `/osd/`;
    const result = await authAxiosClient.get(
      `${SKA_OSO_SERVICES_URL}${OSO_SERVICES_PROPOSAL_PATH}${URL_PATH}cycles`
    );
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : mapping(result.data);
  } catch (e) {
    if (e instanceof Error) {
      return e.message;
    }
    return 'error.API_UNKNOWN_ERROR';
  }
}

export default GetOSDCycles;
