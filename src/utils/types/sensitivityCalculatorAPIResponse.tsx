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
    status: string;
    data: {
      data: {
        result: {
          state: {
            pwv: number;
            eta_system: number;
            eta_pointing: number;
            eta_coherence: number;
            eta_digitisation: number;
            eta_correlation: number;
            eta_bandpass: number;
            n_ska: number;
            eta_ska: number;
            n_meer: number;
            eta_meer: number;
            alpha: number;
            frequency: number;
            bandwidth: number;
            t_sys_ska: number;
            t_spl_ska: number;
            t_rx_ska: number;
            t_sys_meer: number;
            t_spl_meer: number;
            t_rx_meer: number;
            t_sky_ska: number;
            t_sky_meer: number;
            t_gal_ska: number;
            t_gal_meer: number;
            el: number;
            rx_band: string;
            array_configuration: string;
            target: string;
          };
          sensitivity: number;
          line_sensitivity: number;
        };
      };
    };
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
