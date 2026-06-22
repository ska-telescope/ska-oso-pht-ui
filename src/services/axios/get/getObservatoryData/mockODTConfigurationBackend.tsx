import { ODTConfigurationBackend } from '@utils/types/odtConfiguration.tsx';

export const MockODTConfigurationBackend: ODTConfigurationBackend = {
  ska_mid: {
    frequency_band: [
      {
        rx_id: 'Band_1',
        min_frequency_hz: 350000000,
        max_frequency_hz: 1050000000,
        band5b_subbands: null
      },
      {
        rx_id: 'Band_2',
        min_frequency_hz: 950000000,
        max_frequency_hz: 1760000000,
        band5b_subbands: null
      },
      {
        rx_id: 'Band_3',
        min_frequency_hz: 1650000000,
        max_frequency_hz: 3050000000,
        band5b_subbands: null
      },
      {
        rx_id: 'Band_4',
        min_frequency_hz: 2800000000,
        max_frequency_hz: 5180000000,
        band5b_subbands: null
      },
      {
        rx_id: 'Band_5a',
        min_frequency_hz: 4600000000,
        max_frequency_hz: 8500000000,
        band5b_subbands: null
      },
      {
        rx_id: 'Band_5b',
        min_frequency_hz: 8300000000,
        max_frequency_hz: 15400000000,
        band5b_subbands: [
          {
            sub_band: 1,
            min_frequency_hz: 8300000000,
            max_frequency_hz: 11000000000,
            lo_frequency_hz: 9150000000,
            sideband: 'LSB'
          },
          {
            sub_band: 2,
            min_frequency_hz: 11000000000,
            max_frequency_hz: 13200000000,
            lo_frequency_hz: 12100000000,
            sideband: 'USB'
          },
          {
            sub_band: 3,
            min_frequency_hz: 13200000000,
            max_frequency_hz: 15400000000,
            lo_frequency_hz: 14300000000,
            sideband: 'USB'
          }
        ]
      }
    ],
    constraints: {
      sun_avoidance_angle_deg: 15.0,
      moon_avoidance_angle_deg: 15.0,
      jupiter_avoidance_angle_deg: 15.0,
      min_elevation_deg: 15.0,
      max_elevation_deg: 85.0
    },
    subarrays: [
      {
        name: 'AA0.5',
        receptors: ['SKA-001', 'SKA-002', 'SKA-003', 'SKA-004'],
        available_bandwidth_hz: 800000000,
        number_pst_beams: 1,
        number_fsps: 4,
        allowed_channel_width_values_hz: [13440, 26880, 53760, 107520]
      },
      {
        name: 'AA1',
        receptors: ['SKA-001', 'SKA-002', 'SKA-003', 'SKA-004'],
        available_bandwidth_hz: 800000000,
        number_pst_beams: 1,
        number_fsps: 4,
        allowed_channel_width_values_hz: [13440, 26880, 53760, 107520]
      },
      {
        name: 'AA2',
        receptors: ['SKA-001', 'SKA-002', 'SKA-003', 'SKA-004'],
        available_bandwidth_hz: 800000000,
        number_pst_beams: 6,
        number_fsps: 26,
        allowed_channel_width_values_hz: [210, 420, 840, 1680, 3360, 6720, 13440, 26880, 53760]
      },
      {
        name: 'Mid_ITF',
        receptors: ['SKA-001'],
        available_bandwidth_hz: 800000000,
        number_pst_beams: 1,
        number_fsps: 1,
        allowed_channel_width_values_hz: [13440]
      }
    ]
  },
  ska_low: {
    frequency_band: {
      min_frequency_hz: 50000000,
      max_frequency_hz: 350000000,
      min_coarse_channel: 64,
      max_coarse_channel: 447,
      coarse_channel_width_hz: 781250.0,
      number_continuum_channels_per_coarse_channel: 144,
      number_zoom_channels_per_coarse_channel: 432,
      number_pst_channels_per_coarse_channel: 216,
      number_pss_channels_per_coarse_channel: 54
    },
    constraints: {
      sun_avoidance_angle_deg: 15.0,
      moon_avoidance_angle_deg: 15.0,
      jupiter_avoidance_angle_deg: 15.0,
      min_elevation_deg: 15.0,
      max_elevation_deg: 90.0
    },
    quality_attribute_metrics: {
      cbf: {
        processors_ready_percent: 100.0
      }
    },
    subarrays: [
      {
        name: 'AA0.5',
        receptors: ['S00001', 'S00002', 'S00003', 'S00004'],
        available_bandwidth_hz: 75000000,
        number_pst_beams: 1,
        number_fsps: 1,
        number_substations: 4,
        number_subarray_beams: 1
      },
      {
        name: 'AA1',
        receptors: ['S00001', 'S00002', 'S00003', 'S00004'],
        available_bandwidth_hz: 75000000,
        number_pst_beams: 1,
        number_fsps: 2,
        number_substations: 8,
        number_subarray_beams: 4
      },
      {
        name: 'AA2',
        receptors: ['S00001', 'S00002', 'S00003', 'S00004'],
        available_bandwidth_hz: 300000000,
        number_pst_beams: 6,
        number_fsps: 6,
        number_substations: 64,
        number_subarray_beams: 48
      },
      {
        name: 'AA2_SV',
        receptors: ['S00001', 'S00002'],
        available_bandwidth_hz: 75000000,
        number_pst_beams: 1,
        number_fsps: 1,
        number_substations: 4,
        number_subarray_beams: 1
      },
      {
        name: 'Low_ITF',
        receptors: ['S00001'],
        available_bandwidth_hz: 75000000,
        number_pst_beams: 1,
        number_fsps: 1,
        number_substations: 1,
        number_subarray_beams: 1
      }
    ]
  }
};
