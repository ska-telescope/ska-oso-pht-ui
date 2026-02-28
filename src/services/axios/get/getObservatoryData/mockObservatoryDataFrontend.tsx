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
        calibrationFactoryDefined: true,
        low: [],
        mid: [],
        maxDataProducts: 1,
        maxObservations: 1,
        maxTargets: 1
      },
      telescopeCapabilities: {
        low: SA_AA2,
        mid: SA_AA2
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
        calibrationFactoryDefined: true,
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
        calibrationFactoryDefined: true,
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
        receiverInformation: [
          {
            rxId: BAND_1_STR,
            minFrequencyHz: 350000000,
            maxFrequencyHz: 1050000000,
            subBands: null
          },
          {
            rxId: BAND_2_STR,
            minFrequencyHz: 950000000,
            maxFrequencyHz: 1760000000,
            subBands: null
          },
          {
            rxId: BAND_3_STR,
            minFrequencyHz: 1650000000,
            maxFrequencyHz: 3050000000,
            subBands: null
          },
          {
            rxId: BAND_4_STR,
            minFrequencyHz: 2800000000,
            maxFrequencyHz: 5180000000,
            subBands: null
          },
          {
            rxId: BAND_5A_STR,
            minFrequencyHz: 4600000000,
            maxFrequencyHz: 8500000000,
            subBands: null
          },
          {
            rxId: BAND_5B_STR,
            minFrequencyHz: 8300000000,
            maxFrequencyHz: 15400000000,
            subBands: null
          }
        ]
      },
      subArrays: [
        {
          subArray: SA_AA2,
          allowedChannelCountRangeMax: [14880, 14880, 14880],
          allowedChannelCountRangeMin: [1],
          allowedChannelWidthValues: [210, 420, 840, 1680],
          availableReceivers: [BAND_1_STR, BAND_2_STR, BAND_5A_STR, BAND_5B_STR],
          numberSkaDishes: 64,
          numberMeerkatDishes: 4,
          numberMeerkatPlusDishes: 0,
          maxBaselineKm: 110,
          availableBandwidthHz: 800000000,
          numberChannels: 14880,
          cbfModes: ['CORR', 'PST_BF', 'PSS_BF'],
          numberZoomWindows: 16,
          numberZoomChannels: 14880,
          numberPssBeams: 384,
          numberPstBeams: 6,
          psBeamBandwidthHz: 800000000,
          numberFsps: 4
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
