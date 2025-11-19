import ObservatoryData from '@/utils/types/observatoryData';

export const MockObservatoryDataFrontend: ObservatoryData = {
  observatoryPolicy: {
    cycleNumber: 1,
    cycleDescription: 'Science Verification',
    cycleInformation: {
      cycleId: 'SKAO_2027_1',
      proposalOpen: '20260327T12:00:00.000Z',
      proposalClose: '20260512T15:00:00.000z'
    },
    cyclePolicies: {
      maxDataProducts: 1,
      maxObservations: 1,
      maxTargets: 1,
      isCustomAllowed: false,
      normalMaxHours: 100.0
    },
    telescopeCapabilities: {
      mid: 'AA2',
      low: 'AA2'
    }
  },
  capabilities: {
    mid: {
      basicCapabilities: {
        dishElevationLimitDeg: 15.0,
        receiverInformation: [
          {
            rxId: 'Band_1',
            minFrequencyHz: 350000000.0,
            maxFrequencyHz: 1050000000.0
          },
          {
            rxId: 'Band_2',
            minFrequencyHz: 950000000.0,
            maxFrequencyHz: 1760000000.0
          },
          {
            rxId: 'Band_3',
            minFrequencyHz: 1650000000.0,
            maxFrequencyHz: 3050000000.0
          },
          {
            rxId: 'Band_4',
            minFrequencyHz: 2800000000.0,
            maxFrequencyHz: 5180000000.0
          },
          {
            rxId: 'Band_5a',
            minFrequencyHz: 4600000000.0,
            maxFrequencyHz: 8500000000.0
          },
          {
            rxId: 'Band_5b',
            minFrequencyHz: 8300000000.0,
            maxFrequencyHz: 15400000000.0
          }
        ]
      },
      AA2: {
        availableReceivers: ['Band_1', 'Band_2', 'Band_5a', 'Band_5b'],
        numberSkaDishes: 64,
        numberMeerkatDishes: 4,
        numberMeerkatPlusDishes: 0,
        maxBaselineKm: 110.0,
        availableBandwidthHz: 800000000.0,
        numberChannels: 14880,
        cbfModes: ['CORR', 'PST_BF', 'PSS_BF'],
        numberZoomWindows: 16,
        numberZoomChannels: 14880,
        numberPssBeams: 384,
        numberPstBeams: 6,
        psBeamBandwidthHz: 800000000.0,
        numberFsps: 4
      }
    },
    low: {
      basicCapabilities: {
        minFrequencyHz: 50000000.0,
        maxFrequencyHz: 350000000.0
      },
      AA2: {
        numberStations: 64,
        numberSubstations: 720,
        numberBeams: 8,
        maxBaselineKm: 40.0,
        availableBandwidthHz: 150000000.0,
        channelWidthHz: 5400,
        cbfModes: ['vis', 'pst', 'pss'],
        numberZoomWindows: 16,
        numberZoomChannels: 1800,
        numberPssBeams: 30,
        numberPstBeams: 4,
        numberVlbiBeams: 0,
        psBeamBandwidthHz: 118000000.0,
        numberFsps: 10
      }
    }
  }
};
