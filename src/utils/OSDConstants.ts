import {
  MICROSECOND_LABEL,
  MILLISECOND_LABEL,
  NANOSECOND_LABEL,
  SA_AA2,
  SA_CUSTOM,
  SECOND_LABEL,
  SUPPLIED_TYPE_INTEGRATION,
  SUPPLIED_TYPE_SENSITIVITY
} from '@utils/constants.ts';

//NOTE:: not to be referenced directly, outside useOSDAccessors
export const OSD_CONSTANTS = {
  // TODO create a type for this
  array: [
    {
      value: 1,
      subarray: [
        // MID
        {
          value: SA_AA2,
          map: SA_AA2,
          label: 'AA2',
          numOf13mAntennas: 0
        },
        {
          value: SA_CUSTOM,
          map: 'Custom',
          label: 'Custom',
          numOf15mAntennas: 133,
          numOf13mAntennas: 64,
          numOfStations: 0
        }
      ],
      bandWidth: [
        { label: '3.125 MHz', value: 1, mapping: 'MHz' },
        { label: '6.25 MHz', value: 2, mapping: 'MHz' },
        { label: '12.5 MHz', value: 3, mapping: 'MHz' },
        { label: '25 MHz', value: 4, mapping: 'MHz' },
        { label: '50 MHz', value: 5, mapping: 'MHz' },
        { label: '100 MHz', value: 6, mapping: 'MHz' },
        { label: '200 MHz', value: 7, mapping: 'MHz' }
      ]
    },
    {
      value: 2,
      subarray: [
        // LOW
        {
          value: SA_AA2,
          map: 'LOW_AA2_all',
          label: 'AA2',
          numOf13mAntennas: 0,
          continuumSpectralAveragingMax: 13812
        },
        {
          value: SA_CUSTOM,
          map: 'Custom',
          label: 'Custom',
          numOf15mAntennas: 0,
          numOf13mAntennas: 0,
          numOfStations: 512,
          continuumSpectralAveragingMax: 27624
        }
      ],
      bandWidth: [
        { label: '24.4140625 kHz', value: 1, mapping: 'kHz' },
        { label: '48.828125 kHz', value: 2, mapping: 'kHz' },
        { label: '97.65625 kHz', value: 3, mapping: 'kHz' },
        { label: '195.3125 kHz', value: 4, mapping: 'kHz' },
        { label: '390.625 kHz', value: 5, mapping: 'kHz' },
        { label: '781.25 kHz', value: 6, mapping: 'kHz' },
        { label: '1562.5 kHz', value: 7, mapping: 'kHz' },
        { label: '3125 kHz', value: 8, mapping: 'kHz' }
      ]
    }
  ],
  SpectralAveraging: [
    { label: '1', value: 1, lookup: 1 },
    { label: '2', value: 2, lookup: 2 },
    { label: '3', value: 3, lookup: 3 },
    { label: '4', value: 4, lookup: 4 },
    { label: '6', value: 6, lookup: 6 },
    { label: '8', value: 8, lookup: 8 },
    { label: '12', value: 12, lookup: 12 },
    { label: '16', value: 16, lookup: 16 },
    { label: '24', value: 24, lookup: 24 },
    { label: '31', value: 31, lookup: 31 },
    { label: '32', value: 32, lookup: 32 },
    { label: '48', value: 48, lookup: 48 }
  ],
  CentralFrequencyOBLow: [{ lookup: 0, value: 200 }],
  CentralFrequencyOB1: [
    { lookup: 3, label: 'AA2', value: 0.7 },
    { lookup: 20, label: 'Custom', value: 0.7975 }
  ],
  CentralFrequencyOB2: [
    { lookup: 3, label: 'AA2', value: 1.355 },
    { lookup: 20, label: 'Custom', value: 1.31 }
  ],
  CentralFrequencyOB5a: [{ value: 6.55 }],
  CentralFrequencyOB5b: [{ value: 11.85 }],
  ContinuumBandwidthOBLow: [
    { lookup: 3, label: 'AA2', value: 150 },
    { lookup: 20, label: 'Custom', value: 300 }
  ],
  ContinuumBandwidthOB1: [
    { lookup: 3, label: 'AA2', value: 0.7 },
    { lookup: 20, label: 'Custom', value: 0.435 }
  ],
  ContinuumBandwidthOB2: [
    { lookup: 3, label: 'AA2', value: 0.8 },
    { lookup: 20, label: 'Custom', value: 0.72 }
  ],
  ContinuumBandwidthOB5a: [
    { lookup: 3, label: 'AA2', value: 0.8 },
    { lookup: 20, label: 'Custom', value: 3.9 }
  ],
  ContinuumBandwidthOB5b: [
    { lookup: 3, label: 'AA2', value: 0.8 },
    { lookup: 20, label: 'Custom', value: 5 }
  ],
  SpectralResolutionObLow: [{ value: '5.43 kHz (8.1 km/s)' }],
  SpectralResolutionOb1: [
    { lookup: 0.7, value: '13.44 kHz (5.8 km/s)' },
    { lookup: 0.7975, value: '13.44 kHz (5.1 km/s)' }
  ],
  SpectralResolutionOb2: [
    { lookup: 1.355, value: '13.44 kHz (3.0 km/s)' },
    { lookup: 1.31, value: '13.44 kHz (3.1 km/s)' }
  ],
  SpectralResolutionOb5a: [{ value: '13.44 kHz (615.1 m/s)' }],
  SpectralResolutionOb5b: [{ value: '13.44 kHz (340.0 m/s)' }],
  // the spectral resolution matches a bandwidth value
  SpectralResolutionObLowZoom: [
    { value: '14.128508391203704 Hz (21.2 m/s)', bandWidthValue: 1 },
    { value: '28.25701678240741 Hz (42.4 m/s)', bandWidthValue: 2 },
    { value: '56.51403356481482 Hz (84.7 m/s)', bandWidthValue: 3 },
    { value: '113.02806712962963 Hz (169.4 m/s)', bandWidthValue: 4 },
    { value: '226.05613425925927 Hz (338.8 m/s)', bandWidthValue: 5 },
    { value: '452.11226851851853 Hz (677.7 m/s)', bandWidthValue: 6 },
    { value: '904.2245370370371 Hz (1.4 km/s)', bandWidthValue: 7 },
    { value: '1808.4490740740741 Hz (2.7 km/s)', bandWidthValue: 8 }
  ],
  // the spectral resolution matches a lookup and bandwidth value
  SpectralResolutionOb1Zoom: [
    { lookup: '0.7975', value: '0.21 kHz (78.9 m/s)', bandWidthValue: 1 },
    { lookup: '0.7975', value: '0.42 kHz (157.9 m/s)', bandWidthValue: 2 },
    { lookup: '0.7975', value: '0.84 kHz (315.8 m/s)', bandWidthValue: 3 },
    { lookup: '0.7975', value: '1.68 kHz (631.5 m/s)', bandWidthValue: 4 },
    { lookup: '0.7975', value: '3.36 kHz (1.3 m/s)', bandWidthValue: 5 },
    { lookup: '0.7975', value: '6.72 kHz (2.5 m/s)', bandWidthValue: 6 },
    { lookup: '0.7975', value: '13.44 kHz (5.1 m/s)', bandWidthValue: 7 },
    { lookup: '0.7', value: '0.21 kHz (89.9 m/s)', bandWidthValue: 1 },
    { lookup: '0.7', value: '0.42 kHz (179.9 m/s)', bandWidthValue: 2 },
    { lookup: '0.7', value: '0.84 kHz (359.8 m/s)', bandWidthValue: 3 },
    { lookup: '0.7', value: '1.68 kHz (719.5 m/s)', bandWidthValue: 4 },
    { lookup: '0.7', value: '3.36 kHz (1.4 km/s)', bandWidthValue: 5 },
    { lookup: '0.7', value: '6.72 kHz (2.9 km/s)', bandWidthValue: 6 },
    { lookup: '0.7', value: '13.44 kHz (5.8 km/s)', bandWidthValue: 7 }
  ],
  SpectralResolutionOb2Zoom: [
    { lookup: '1.31', value: '0.21 kHz (48.1 m/s)', bandWidthValue: 1 },
    { lookup: '1.31', value: '0.42 kHz (96.1 m/s)', bandWidthValue: 2 },
    { lookup: '1.31', value: '0.84 kHz (192.2 m/s)', bandWidthValue: 3 },
    { lookup: '1.31', value: '1.68 kHz (384.5 m/s)', bandWidthValue: 4 },
    { lookup: '1.31', value: '3.36 kHz (768.9 m/s)', bandWidthValue: 5 },
    { lookup: '1.31', value: '6.72 kHz (1.5 km/s)', bandWidthValue: 6 },
    { lookup: '1.31', value: '13.44 kHz (3.1 km/s)', bandWidthValue: 7 },
    { lookup: '1.355', value: '0.21 kHz (46.5 m/s)', bandWidthValue: 1 },
    { lookup: '1.355', value: '0.42 kHz (92.9 m/s)', bandWidthValue: 2 },
    { lookup: '1.355', value: '0.84 kHz (185.8 m/s)', bandWidthValue: 3 },
    { lookup: '1.355', value: '1.68 kHz (371.7 m/s)', bandWidthValue: 4 },
    { lookup: '1.355', value: '3.36 kHz (743.4 m/s)', bandWidthValue: 5 },
    { lookup: '1.355', value: '6.72 kHz (1.5 km/s)', bandWidthValue: 6 },
    { lookup: '1.355', value: '13.44 kHz (3.0 km/s)', bandWidthValue: 7 }
  ],
  // the spectral resolution matches a bandwidth value
  SpectralResolutionOb5aZoom: [
    { value: '0.21 kHz (9.6 m/s)', bandWidthValue: 1 },
    { value: '0.42 kHz (19.2 m/s)', bandWidthValue: 2 },
    { value: '0.84 kHz (38.4 m/s)', bandWidthValue: 3 },
    { value: '1.68 kHz (76.9 m/s)', bandWidthValue: 4 },
    { value: '3.36 kHz (153.8 m/s)', bandWidthValue: 5 },
    { value: '6.72 kHz (307.6 m/s)', bandWidthValue: 6 },
    { value: '13.44 kHz (615.1 m/s)', bandWidthValue: 7 }
  ],
  SpectralResolutionOb5bZoom: [
    { value: '0.21 kHz (5.3 m/s)', bandWidthValue: 1 },
    { value: '0.42 kHz (10.6 m/s)', bandWidthValue: 2 },
    { value: '0.84 kHz (21.3 m/s)', bandWidthValue: 3 },
    { value: '1.68 kHz (42.5 m/s)', bandWidthValue: 4 },
    { value: '3.36 kHz (85.0 m/s)', bandWidthValue: 5 },
    { value: '6.72 kHz (170.0 m/s)', bandWidthValue: 6 },
    { value: '13.44 kHz (340.0 m/s))', bandWidthValue: 7 }
  ],
  Supplied: [
    {
      label: 'Integration Time', // TODO check if label still needed as we use sensCalcResultsLabel in calculate results
      sensCalcResultsLabel: 'integrationTime',
      mappingLabel: 'integration_time',
      value: SUPPLIED_TYPE_INTEGRATION,
      units: [
        { label: 'd', value: 1 },
        { label: 'h', value: 2 },
        { label: 'min', value: 3 },
        { label: SECOND_LABEL, value: 4 },
        { label: MILLISECOND_LABEL, value: 5 },
        { label: NANOSECOND_LABEL, value: 6 },
        { label: MICROSECOND_LABEL, value: 7 }
      ]
    },
    {
      label: 'Sensitivity', // TODO check if label still needed as we use sensCalcResultsLabel in calculate results
      sensCalcResultsLabel: 'sensitivity',
      mappingLabel: 'sensitivity',
      value: SUPPLIED_TYPE_SENSITIVITY,
      units: [
        { label: 'Jy/beam', value: 1 },
        { label: 'mJy/beam', value: 2 },
        { label: 'μJy/beam', value: 3 },
        { label: 'nJy/beam', value: 4 },
        { label: 'K', value: 5 },
        { label: 'mK', value: 6 },
        { label: 'uK', value: 7 }
      ]
    }
  ],
  Units: [
    { label: 'GHz', value: 1 },
    { label: 'MHz', value: 2 },
    { label: 'kHz', value: 3 },
    { label: 'Hz', value: 4 }
  ]
};
