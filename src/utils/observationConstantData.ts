import {
  OB_SUBARRAY_AA05,
  OB_SUBARRAY_AA1,
  OB_SUBARRAY_AA2,
  OB_SUBARRAY_AA2_CORE,
  OB_SUBARRAY_AA4,
  OB_SUBARRAY_AA4_13,
  OB_SUBARRAY_AA4_15,
  OB_SUBARRAY_AA4_CORE,
  OB_SUBARRAY_AA_STAR,
  OB_SUBARRAY_AA_STAR_15,
  OB_SUBARRAY_AA_STAR_CORE,
  OB_SUBARRAY_CUSTOM
} from '@utils/constants.ts';

export const OBSERVATION = {
  array: [
    {
      value: 1,
      subarray: [
        // MID
        {
          value: OB_SUBARRAY_AA05,
          map: 'AA0.5',
          label: 'AA0.5',
          numOf15mAntennas: 4,
          numOf13mAntennas: 0,
          numOfStations: 0,
          disableForBand5: false,
          maxContBandwidthHz: 800e6
        },
        {
          value: OB_SUBARRAY_AA1,
          map: 'AA1',
          label: 'AA1',
          numOf15mAntennas: 8,
          numOf13mAntennas: 0,
          numOfStations: 0,
          disableForBand5: false,
          maxContBandwidthHz: 800e6
        },
        {
          value: OB_SUBARRAY_AA2,
          map: 'AA2',
          label: 'AA2',
          numOf13mAntennas: 0,
          numOfStations: 0,
          disableForBand5: false
        },
        {
          value: OB_SUBARRAY_AA_STAR,
          map: 'AA*',
          label: 'AA*',
          numOf15mAntennas: 80,
          numOf13mAntennas: 64,
          numOfStations: 0,
          disableForBand5: true
        },
        {
          value: OB_SUBARRAY_AA_STAR_15,
          map: 'AA* (15-m antennas only)',
          label: 'AA* (15-m antennas only)',
          numOf15mAntennas: 80,
          numOf13mAntennas: 0,
          numOfStations: 0,
          disableForBand5: false
        },
        {
          value: OB_SUBARRAY_AA4,
          map: 'AA4',
          label: 'AA4',
          numOf15mAntennas: 133,
          numOf13mAntennas: 64,
          numOfStations: 0,
          disableForBand5: true
        },
        {
          value: OB_SUBARRAY_AA4_15,
          map: 'AA4 (15-m antennas only)',
          label: 'AA4 (15-m antennas only)',
          numOf15mAntennas: 133,
          numOf13mAntennas: 0,
          numOfStations: 0,
          disableForBand5: false
        },
        {
          value: OB_SUBARRAY_AA4_13,
          map: 'AA*/AA4 (13.5-m antennas only)',
          label: 'AA*/AA4 (13.5-m antennas only)',
          numOf15mAntennas: 0,
          numOf13mAntennas: 64,
          numOfStations: 0,
          disableForBand5: true
        },
        {
          value: OB_SUBARRAY_CUSTOM,
          map: 'Custom',
          label: 'Custom',
          numOf15mAntennas: 133,
          numOf13mAntennas: 64,
          numOfStations: 0,
          disableForBand5: false
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
          value: OB_SUBARRAY_AA05,
          map: 'LOW_AA05_all',
          label: 'AA0.5',
          numOf15mAntennas: 0,
          numOf13mAntennas: 0,
          numOfStations: 6,
          disableForBand5: false,
          continuumSpectralAveragingMax: 6906,
          maxContBandwidthHz: 75e6
        },
        {
          value: OB_SUBARRAY_AA1,
          map: 'LOW_AA1_all',
          label: 'AA1',
          numOf15mAntennas: 0,
          numOf13mAntennas: 0,
          numOfStations: 18,
          disableForBand5: false,
          continuumSpectralAveragingMax: 6906,
          maxContBandwidthHz: 75e6
        },
        {
          value: OB_SUBARRAY_AA2,
          map: 'LOW_AA2_all',
          label: 'AA2',
          numOf15mAntennas: 0,
          numOf13mAntennas: 0,
          disableForBand5: false,
          continuumSpectralAveragingMax: 13812
        },
        {
          value: OB_SUBARRAY_AA2_CORE,
          map: 'LOW_AA2_core_only',
          label: 'AA2 (core only)',
          numOf15mAntennas: 0,
          numOf13mAntennas: 0,
          numOfStations: 40,
          disableForBand5: false,
          continuumSpectralAveragingMax: 13812,
          maxContBandwidthHz: 150e6
        },
        {
          value: OB_SUBARRAY_AA_STAR,
          map: 'LOW_AAstar_all',
          label: 'AA*',
          numOf15mAntennas: 0,
          numOf13mAntennas: 0,
          numOfStations: 307,
          disableForBand5: false,
          continuumSpectralAveragingMax: 27624
        },
        {
          value: OB_SUBARRAY_AA_STAR_CORE,
          map: 'LOW_AAstar_core_only',
          label: 'AA* (core only)',
          numOf15mAntennas: 0,
          numOf13mAntennas: 0,
          numOfStations: 199,
          disableForBand5: false,
          continuumSpectralAveragingMax: 27624
        },
        {
          value: OB_SUBARRAY_AA4,
          map: 'LOW_AA4_all',
          label: 'AA4',
          numOf15mAntennas: 0,
          numOf13mAntennas: 0,
          numOfStations: 512,
          disableForBand5: false,
          continuumSpectralAveragingMax: 27624
        },
        {
          value: OB_SUBARRAY_AA4_CORE,
          map: 'LOW_AA4_core_only',
          label: 'AA4 (core only)',
          numOf15mAntennas: 0,
          numOf13mAntennas: 0,
          numOfStations: 224,
          disableForBand5: false,
          continuumSpectralAveragingMax: 27624
        },
        {
          value: OB_SUBARRAY_CUSTOM,
          map: 'Custom',
          label: 'Custom',
          numOf15mAntennas: 0,
          numOf13mAntennas: 0,
          numOfStations: 512,
          disableForBand5: false,
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
  ]
};
