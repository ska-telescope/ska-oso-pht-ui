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
          value: OB_SUBARRAY_AA2,
          map: 'AA2',
          label: 'AA2',
          numOf13mAntennas: 0,
          numOfStations: 0,
        },
        {
          value: OB_SUBARRAY_CUSTOM,
          map: 'Custom',
          label: 'Custom',
          numOf15mAntennas: 133,
          numOf13mAntennas: 64,
          numOfStations: 0,
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
          value: OB_SUBARRAY_AA2,
          map: 'LOW_AA2_all',
          label: 'AA2',
          numOf15mAntennas: 0,
          numOf13mAntennas: 0,
          continuumSpectralAveragingMax: 13812
        },
        {
          value: OB_SUBARRAY_CUSTOM,
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
  ]
};
