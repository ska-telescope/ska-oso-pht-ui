import { CalculateMidContinuum } from '../../../../utils/types/sensitivityCalculatorQuerry'

export const MockQueryMidCalculate: CalculateMidContinuum = {
  integration_time_s: 600,
  rx_band: 'Band 1',
  subarray_configuration: 'AA4',
  freq_centre_hz: 797500000,
  bandwidth_hz: 435000000,
  spectral_averaging_factor: 2,
  pointing_centre: '00:00:00.0 00:00:00.0',
  pwv: 10,
  el: 45,
  n_subbands: 1
};

export const MockQuerryMidCalculateZoom = {
  rx_band: 'Band 1',
  subarray_configuration: 'AA4',
  freq_centres_hz: 797500000,
  pointing_centre: '00:00:00.0 00:00:00.0',
  pwv: 10,
  el: 45,
  spectral_resolutions_hz: 210,
  total_bandwidths_hz: 3125000,
  integration_time_s: 600
};

export const MockResponseMidCalculate = {
    continuum_sensitivity: {
        value: 4.251275922660714e-06,
        unit: "Jy"
    },
    spectral_sensitivity: {
        value: 0.0005408156982760501,
        unit: "Jy"
    },
    spectropolarimetry_results: {
        fwhm_of_the_rmsf: {
            value: 19.25408156918427,
            unit: "rad / m2"
        },
        max_faraday_depth_extent: {
            value: 36.01049157747405,
            unit: "rad / m2"
        },
        max_faraday_depth: {
            value: 69947.81170649514,
            unit: "rad / m2"
        }
    }
};

export const MockResponseMidCalculateZoom = [
  {
      freq_centre: {
          "value": 797500000.0,
          "unit": "Hz"
      },
      spectral_sensitivity: {
          value: 0.006118631161970125,
          unit: "Jy"
      },
      spectropolarimetry_results: {
          fwhm_of_the_rmsf: {
              value: 3128.146807579617,
              unit: "rad / m2"
          },
          max_faraday_depth_extent: {
              value: 22.31874920746199,
              unit: "rad / m2"
          },
          max_faraday_depth: {
              value: 23136997.673582196,
              unit: "rad / m2"
          }
      }
  }
];
