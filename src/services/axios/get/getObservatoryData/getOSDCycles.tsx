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
  subarrayConfigurationLow,
  subarrayConfigurationMidBackend,
  subarrayConfigurationLowBackend,
  subBands
} from '@/utils/types/observatoryData';
import { generateId } from '@/utils/helpers';

/*****************************************************************************************************************************/

export function GetMockData(mock = [MockObservatoryDataBackend]): ObservatoryData {
  return osdMapping(mock);
}

export const toLowerCaseArray = (value: unknown): string[] => {
  const values = Array.isArray(value) ? value : [value];
  return values.filter((item) => typeof item === 'string').map((item) => item.toLowerCase());
};

// The OSD may label a cycle's primary LOW/MID array assembly as "AA2" or "AA2_SV" - both name
// the same "primary/default subarray slot" this app tracks internally as SA_AA2 (see
// pickArrayAssemblyData below for the equivalent normalisation on the capabilities side).
const normalizeArrayAssembly = (value: string): string => (value === 'aa2_sv' ? SA_AA2 : value);

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
        ].filter((band) => band !== ''),
        low: toLowerCaseArray(inc?.observatory_policy?.telescope_capabilities?.Low).map(
          normalizeArrayAssembly
        ),
        mid: toLowerCaseArray(inc?.observatory_policy?.telescope_capabilities?.Mid).map(
          normalizeArrayAssembly
        )
      },
      telescopeCapabilities: {
        low: inc?.observatory_policy?.telescope_capabilities?.Low,
        mid: inc?.observatory_policy?.telescope_capabilities?.Mid
      },
      capabilities: mapCapabilities(inc),
      type: inc?.observatory_policy?.type ?? 'Science Verification'
    };
  };

  const mapSubBands = (incSb: subBandsBackend[] | null): subBands[] | null => {
    if (!incSb) return null;

    return incSb.map((sb) => ({
      subBand: sb.sub_band,
      maxFrequencyHz: sb.max_frequency_hz,
      minFrequencyHz: sb.min_frequency_hz,
      loFrequencyHz: sb.lo_frequency_hz,
      sideband: sb.sideband
    }));
  };

  // The OSD returns a single array_assembly key per cycle (e.g. "AA2" or "AA2_SV"),
  // matching that cycle's own telescope_capabilities - not always "AA2". Find it dynamically
  // rather than assuming the key, but keep tagging the resulting entry as SA_AA2: that tag is
  // this app's internal "primary/default subarray slot" identifier, used throughout the UI to
  // look up the default subarray regardless of which real array_assembly backs it.
  const pickArrayAssemblyData = <T,>(section?: Record<string, T>): T | undefined => {
    if (!section) return undefined;
    const key = Object.keys(section).find((k) => k !== 'basic_capabilities' && section[k] != null);
    return key ? section[key] : undefined;
  };

  const mapCapabilities = (inData: ObservatoryDataBackend): ObservatoryData['capabilities'] => {
    const midAA = pickArrayAssemblyData<subarrayConfigurationMidBackend>(
      inData?.capabilities?.mid as unknown as Record<string, subarrayConfigurationMidBackend>
    );
    const lowAA = pickArrayAssemblyData<subarrayConfigurationLowBackend>(
      inData?.capabilities?.low as unknown as Record<string, subarrayConfigurationLowBackend>
    );

    return {
      mid: inData?.capabilities?.mid
        ? {
            basicCapabilities: {
              dishElevationLimitDeg:
                inData?.capabilities?.mid?.basic_capabilities?.dish_elevation_limit_deg,
              receiverInformation:
                inData?.capabilities?.mid?.basic_capabilities?.receiver_information?.map(
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
                allowedChannelCountRangeMax: midAA?.allowed_channel_count_range_max,
                allowedChannelCountRangeMin: midAA?.allowed_channel_count_range_min,
                allowedChannelWidthValues: midAA?.allowed_channel_width_values,
                availableReceivers: midAA?.available_receivers,
                numberSkaDishes: midAA?.number_ska_dishes,
                numberMeerkatDishes: midAA?.number_meerkat_dishes,
                numberMeerkatPlusDishes: midAA?.number_meerkatplus_dishes,
                maxBaselineKm: midAA?.max_baseline_km,
                availableBandwidthHz: midAA?.available_bandwidth_hz,
                numberChannels: midAA?.number_channels,
                cbfModes: midAA?.cbf_modes,
                numberZoomWindows: midAA?.number_zoom_windows,
                numberZoomChannels: midAA?.number_zoom_channels,
                numberPssBeams: midAA?.number_pss_beams,
                numberPstBeams: midAA?.number_pst_beams,
                psBeamBandwidthHz: midAA?.ps_beam_bandwidth_hz,
                numberFsps: midAA?.number_fsps
              },
              // MID SA_AA_STAR is currently mocedk to give us access to more than 1 subbarray configuration
              {
                subArray: SA_AA_STAR,
                allowedChannelCountRangeMax: [214748647],
                allowedChannelCountRangeMin: [1],
                allowedChannelWidthValues: [
                  210, 420, 840, 1680, 3360, 6720, 13440, 26880, 40320, 53760, 80640, 107520,
                  161280, 215040, 322560, 416640, 430080, 645120
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
                numberStations: lowAA?.number_stations,
                numberSubstations: lowAA?.number_substations,
                maxBaselineKm: lowAA?.max_baseline_km,
                availableBandwidthHz: lowAA?.available_bandwidth_hz,
                cbfModes: lowAA?.cbf_modes,
                numberZoomWindows: lowAA?.number_zoom_windows,
                numberZoomChannels: lowAA?.number_zoom_channels,
                numberPssBeams: lowAA?.number_pss_beams,
                numberPstBeams: lowAA?.number_pst_beams,
                psBeamBandwidthHz: lowAA?.ps_beam_bandwidth_hz,
                numberFsps: lowAA?.number_fsps,
                channelWidthHz: lowAA?.channel_width_hz,
                numberBeams: lowAA?.number_beams,
                numberVlbiBeams: lowAA?.number_vlbi_beams
              },
              // LOW SA_AA_STAR is currently mocked to give us access to more than 1 subbarray configuration
              {
                subArray: SA_AA_STAR,
                numberStations: lowAA?.number_stations,
                numberSubstations: lowAA?.number_substations,
                maxBaselineKm: lowAA?.max_baseline_km,
                availableBandwidthHz: lowAA?.available_bandwidth_hz,
                cbfModes: lowAA?.cbf_modes,
                numberZoomWindows: lowAA?.number_zoom_windows,
                numberZoomChannels: lowAA?.number_zoom_channels,
                numberPssBeams: lowAA?.number_pss_beams,
                numberPstBeams: lowAA?.number_pst_beams,
                psBeamBandwidthHz: lowAA?.ps_beam_bandwidth_hz,
                numberFsps: lowAA?.number_fsps,
                channelWidthHz: lowAA?.channel_width_hz,
                numberBeams: lowAA?.number_beams,
                numberVlbiBeams: lowAA?.number_vlbi_beams
              }
            ] as subarrayConfigurationLow[]
          }
        : null
    };
  };

  //  TODO: the mock cycles below have no real OSD-provided capability data of their
  // own so they explicitly use AA2's capabilities as a template.
  // Revisit once OSD provides capabilities for the "Proposal" cycle type - change this
  // constant if a different cycle should become the template.
  const FALLBACK_CAPABILITIES_CYCLE_INDEX = 0;
  const fallbackCapabilities = mapCapabilities(inData[FALLBACK_CAPABILITIES_CYCLE_INDEX]);

  const result = {
    policies: inData.map((cycle) => mapCycle(cycle)),
    capabilities: fallbackCapabilities
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
    capabilities: fallbackCapabilities,
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
    capabilities: fallbackCapabilities,
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
