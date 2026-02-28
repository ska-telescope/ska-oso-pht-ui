// import axios from 'axios';
import {
  SA_AA2,
  SA_AA_STAR,
  OSO_SERVICES_PROPOSAL_PATH,
  SKA_OSO_SERVICES_URL,
  USE_LOCAL_DATA,
  BAND_LOW_STR,
  BAND_5B_STR,
  BAND_1_STR
} from '@utils/constants.ts';
import useAxiosAuthClient from '@services/axios/axiosAuthClient/axiosAuthClient.tsx';
import { MockObservatoryDataBackend } from './mockObservatoryDataBackend';
import {
  ObservatoryDataBackend,
  ObservatoryData,
  ObservatoryPolicy,
  subBandsBackend,
  ReceiverInformationBackend,
  subarrayConfigurationMid,
  subBands
} from '@/utils/types/observatoryData';
import { generateId } from '@/utils/helpers';

/*****************************************************************************************************************************/

export function GetMockData(mock = [MockObservatoryDataBackend]): ObservatoryData {
  return osdMapping(mock);
}

export const toLowerCaseArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];

  return value.filter(item => typeof item === 'string').map(item => item.toLowerCase());
};

export const osdMapping = (inData: ObservatoryDataBackend[]): ObservatoryData => {
  const mapCycle = (inc: ObservatoryDataBackend): ObservatoryPolicy => {
    return {
      cycleNumber: inc?.observatory_policy?.cycle_number,
      // set to SV if not provided
      cycleDescription: inc?.observatory_policy?.cycle_description ?? 'Science Verification',
      cycleInformation: {
        cycleId: inc?.observatory_policy?.cycle_id ?? generateId('CYCLE-', 3),
        proposalOpen: inc?.observatory_policy?.cycle_information?.proposal_open,
        proposalClose: inc?.observatory_policy?.cycle_information?.proposal_close
      },
      cyclePolicies: {
        // set to 1 for SV if not provided
        // this may need to be revisited after Science Verification or when the OSD data is more complete
        maxDataProducts: inc?.observatory_policy?.cycle_policies?.max_data_products ?? 1,
        maxObservations: inc?.observatory_policy?.cycle_policies?.max_observation_setups ?? 1,
        maxTargets: inc?.observatory_policy?.cycle_policies?.max_targets ?? 1,
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
      type: inc?.observatory_policy?.type ?? 'Science Verification'
    };
  };

  const mapSubBands = (incSb: subBandsBackend[] | null): subBands[] | null => {
    if (!incSb) return null;

    return incSb.map(sb => ({
      subBand: sb.sub_band,
      maxFrequencyHz: sb.max_frequency_hz,
      minFrequencyHz: sb.min_frequency_hz,
      loFrequencyHz: sb.lo_frequency_hz,
      sideband: sb.sideband
    }));
  };

  const mapCapabilities = (inData: ObservatoryDataBackend): ObservatoryData['capabilities'] => {
    return {
      mid: inData?.capabilities?.mid
        ? {
            basicCapabilities: {
              dishElevationLimitDeg:
                inData?.capabilities?.mid?.basic_capabilities?.dish_elevation_limit_deg,
              receiverInformation: inData?.capabilities?.mid?.basic_capabilities?.receiver_information?.map(
                (rx: ReceiverInformationBackend) => ({
                  rxId: rx.rx_id,
                  minFrequencyHz: rx.min_frequency_hz,
                  maxFrequencyHz: rx.max_frequency_hz,
                  subBands: mapSubBands(rx.sub_bands)
                })
              )
            },
            subArrays: [
              {
                subArray: SA_AA2,
                allowedChannelCountRangeMax:
                  inData?.capabilities?.mid?.AA2.allowed_channel_count_range_max,
                allowedChannelCountRangeMin:
                  inData?.capabilities?.mid?.AA2.allowed_channel_count_range_min,
                allowedChannelWidthValues:
                  inData?.capabilities?.mid?.AA2.allowed_channel_width_values,
                availableReceivers: inData?.capabilities?.mid?.AA2.available_receivers,
                numberSkaDishes: inData?.capabilities?.mid?.AA2.number_ska_dishes,
                numberMeerkatDishes: inData?.capabilities?.mid?.AA2.number_meerkat_dishes,
                numberMeerkatPlusDishes: inData?.capabilities?.mid?.AA2.number_meerkatplus_dishes,
                maxBaselineKm: inData?.capabilities?.mid?.AA2.max_baseline_km,
                availableBandwidthHz: inData?.capabilities?.mid?.AA2.available_bandwidth_hz,
                numberChannels: inData?.capabilities?.mid?.AA2.number_channels,
                cbfModes: inData?.capabilities?.mid?.AA2.cbf_modes,
                numberZoomWindows: inData?.capabilities?.mid?.AA2.number_zoom_windows,
                numberZoomChannels: inData?.capabilities?.mid?.AA2.number_zoom_channels,
                numberPssBeams: inData?.capabilities?.mid?.AA2.number_pss_beams,
                numberPstBeams: inData?.capabilities?.mid?.AA2.number_pst_beams,
                psBeamBandwidthHz: inData?.capabilities?.mid?.AA2.ps_beam_bandwidth_hz,
                numberFsps: inData?.capabilities?.mid?.AA2.number_fsps
              },
              // MID SA_AA_STAR is currently mock to give us access to more than 1 subbarray configuration
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
            ] as subarrayConfigurationMid[]
          }
        : null,
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
              // LOW SA_AA_STAR is currently mock to give us access to more than 1 subbarray configuration
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

  const capabilities = inData.map(cycle => mapCapabilities(cycle));

  const mergedCapabilities = capabilities.slice(1).reduce(
    (acc, obj) => {
      for (const key in acc) {
        // keep acc[key] unless obj[key] is NOT null/undefined
        (acc as any)[key] = (obj as any)[key] ?? (acc as any)[key];
      }
      return acc;
    },
    { ...capabilities[0] } as ObservatoryData['capabilities']
  );

  const result = {
    policies: inData.map(cycle => mapCycle(cycle)),
    capabilities: mergedCapabilities
  };

  // add hardcoded cycles for proposal flow as this is not provided yet by OSD:
  result.policies.push({
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
  });

  result.policies.push({
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
  });

  return result;
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
    return typeof result === 'undefined'
      ? 'error.API_UNKNOWN_ERROR'
      : osdMapping(result.data.reverse()); // reverse to to display LOW AA2 first
  } catch (e) {
    if (e instanceof Error) {
      return e.message;
    }
    return 'error.API_UNKNOWN_ERROR';
  }
}

export default GetOSDCycles;
