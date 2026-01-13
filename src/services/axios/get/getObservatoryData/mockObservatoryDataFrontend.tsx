import {
  BAND_1_STR,
  BAND_2_STR,
  BAND_3_STR,
  BAND_4_STR,
  BAND_5A_STR,
  BAND_5B_STR,
  BAND_LOW_STR,
  SA_AA2,
  SA_AA_STAR
} from '@/utils/constants';
import ObservatoryData from '@/utils/types/observatoryData';

export const MockObservatoryDataFrontend: ObservatoryData = {
  policies: [
    {
      cycleNumber: 1,
      cycleDescription: 'Science Verification',
      cycleInformation: {
        cycleId: 'SKAO_2027_1',
        proposalOpen: '20260327T12:00:00.000Z',
        proposalClose: '20260512T15:00:00.000z'
      },
      cyclePolicies: {
        bands: [BAND_LOW_STR, BAND_5B_STR],
        low: [],
        mid: []
      },
      telescopeCapabilities: {
        low: SA_AA2,
        mid: SA_AA2
      }
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
    low: {
      basicCapabilities: {
        minFrequencyHz: 50000000,
        maxFrequencyHz: 350000000
      },
      subArrays: [
        {
          numberStations: 68,
          numberSubstations: 720,
          numberBeams: 8,
          maxBaselineKm: 40,
          availableBandwidthHz: 150000000,
          channelWidthHz: null,
          cbfModes: ['vis', 'pst', 'pss'],
          numberZoomWindows: 16,
          numberZoomChannels: 1800,
          numberPssBeams: 30,
          numberPstBeams: 4,
          numberVlbiBeams: 0,
          psBeamBandwidthHz: 118000000,
          numberFsps: 10,
          subArray: SA_AA2
        },
        {
          numberStations: 68,
          numberSubstations: 720,
          numberBeams: 8,
          maxBaselineKm: 40,
          availableBandwidthHz: 150000000,
          channelWidthHz: null,
          cbfModes: ['vis', 'pst', 'pss'],
          numberZoomWindows: 16,
          numberZoomChannels: 1800,
          numberPssBeams: 30,
          numberPstBeams: 4,
          numberVlbiBeams: 0,
          psBeamBandwidthHz: 118000000,
          numberFsps: 10,
          subArray: SA_AA_STAR
        }
      ]
    }
  }
};
