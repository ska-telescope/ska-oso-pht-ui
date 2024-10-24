export type SensitivityCalculatorAPIResponseLow = {
  calculate: {
    data: {
      continuum_sensitivity?: {
        value: number;
        units: string;
      };
      spectral_sensitivity?: {
        value: number;
        unit: string;
      };
      spectropolarimetry_results?: {
        fwhm_of_the_rmsf: {
          value: number;
          unit: string;
        };
        max_faraday_depth_extent?: {
          value: number;
          unit: string;
        };
        max_faraday_depth?: {
          value: number;
          unit: string;
        };
      };
    };
  };
  weighting: {
    beam_size: {
      beam_maj_scaled: number;
      beam_min_scaled: number;
      beam_pa: number;
    };
    confusion_noise: {
      value: number;
      limit_type: string;
    };
    sbs_conv_factor: number;
    weighting_factor: number;
  };
  weightingLine: {
    beam_size: [
      {
        beam_maj_scaled: number;
        beam_min_scaled: number;
        beam_pa: number;
      }
    ];
    confusion_noise: {
      value: number;
      limit_type: string;
    };
    sbs_conv_factor: number[];
    weighting_factor: number;
  };
};

export type SensitivityCalculatorAPIResponseMid = {
  calculate: {
    data: {
      continuum_sensitivity: {
        value: number;
        unit: string;
      };
      spectral_sensitivity: {
        value: number;
        unit: string;
      };
    };
    status: number;
  };
  weighting: {
    beam_size: [
      {
        beam_maj_scaled: number;
        beam_min_scaled: number;
        beam_pa: number;
      }
    ];
    confusion_noise: {
      value: number;
      limit_type: string;
    };
    sbs_conv_factor: number;
    weighting_factor: number;
  };
  weightingLine: [
    {
      beam_size: [
        {
          beam_maj_scaled: number;
          beam_min_scaled: number;
          beam_pa: number;
        }
      ];
      confusion_noise: {
        value: number[];
        limit_type: string[];
      };
      freq_centre: {
        value: number;
        unit: string;
      };
      sbs_conv_factor: number;
      weighting_factor: number;
    }
  ];
};
