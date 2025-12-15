export const sensCalcResultsAPIResponseMock = {
  calculate: {
    continuum_sensitivity: {
      value: 62.30814817980956,
      unit: 'uJy / beam'
    },
    continuum_subband_sensitivities: [],
    spectral_sensitivity: {
      value: 11138.292866730031,
      unit: 'uJy / beam'
    },
    warnings: [],
    spectropolarimetry_results: {
      fwhm_of_the_rmsf: {
        value: 0.7591181409873514,
        unit: 'rad / m2'
      },
      max_faraday_depth_extent: {
        value: 2.6434146128786566,
        unit: 'rad / m2'
      },
      max_faraday_depth: {
        value: 3469.125412082049,
        unit: 'rad / m2'
      }
    }
  },
  weighting: {
    continuum_weighting: {
      weighting_factor: 3.1039069570611137,
      sbs_conv_factor: 1943376.444583797,
      confusion_noise: {
        value: 0.0000015571964705842969,
        limit_type: 'value'
      },
      beam_size: {
        beam_maj_scaled: 0.0015270861091270967,
        beam_min_scaled: 0.0007943803990216175,
        beam_pa: 104.63944269863991
      },
      subbands: []
    },
    spectral_weighting: {
      weighting_factor: 3.7961316440978283,
      sbs_conv_factor: 1303068.7388739265,
      confusion_noise: {
        value: 0.0000026504800547538226,
        limit_type: 'value'
      },
      beam_size: {
        beam_maj_scaled: 0.0016440625961672488,
        beam_min_scaled: 0.0011004322402656584,
        beam_pa: 107.38709285360864
      },
      subbands: []
    }
  },
  transformed_result: {
    weighted_continuum_sensitivity: {
      value: 0.00019339869461690564,
      unit: 'Jy / beam'
    },
    continuum_confusion_noise: {
      value: 0.0000015571964705842969,
      unit: 'Jy / beam'
    },
    total_continuum_sensitivity: {
      value: 0.0001934049635877299,
      unit: 'Jy / beam'
    },
    continuum_synthesized_beam_size: {
      beam_maj: {
        value: 5.497509992857548,
        unit: 'arcsec'
      },
      beam_min: {
        value: 2.8597694364778232,
        unit: 'arcsec'
      }
    },
    continuum_surface_brightness_sensitivity: {
      value: 375.85865050198123,
      unit: 'K'
    },
    weighted_spectral_sensitivity: {
      value: 0.042282426012622984,
      unit: 'Jy / beam'
    },
    spectral_confusion_noise: {
      value: 0.0000026504800547538226,
      unit: 'Jy / beam'
    },
    total_spectral_sensitivity: {
      value: 0.04228242609569585,
      unit: 'Jy / beam'
    },
    spectral_synthesized_beam_size: {
      beam_maj: {
        value: 5.918625346202096,
        unit: 'arcsec'
      },
      beam_min: {
        value: 3.9615560649563704,
        unit: 'arcsec'
      }
    },
    spectral_surface_brightness_sensitivity: {
      value: 55096.90764904839,
      unit: 'K'
    },
    warnings: [],
    subbands: {}
  }
};
