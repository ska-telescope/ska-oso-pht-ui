export type SensitivityCalculatorAPIResponseLow = {
  calculate: {
    sensitivity: number;
    units: string;
  };
  weighting: {
    weighting_factor: number;
    sbs_conv_factor: number[];
    confusion_noise: {
      value: number[];
      limit_type: string[];
    };
    beam_size: [
      {
        beam_maj_scaled: number;
        beam_min_scaled: number;
        beam_pa: number;
      }
    ];
  };
  weightingLine: {
    weighting_factor: number;
    sbs_conv_factor: number[];
    confusion_noise: {
      value: number[];
      limit_type: string[];
    };
    beam_size: [
      {
        beam_maj_scaled: number;
        beam_min_scaled: number;
        beam_pa: number;
      }
    ];
  };
};

export type SensitivityCalculatorAPIResponseMid = {
  calculate: {
    status: string;
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
  weighting: {
    status: string;
    data: {
      weighting_factor: number;
      sbs_conv_factor: number[];
      confusion_noise: {
        value: number[];
        limit_type: string[];
      };
      beam_size: [
        {
          beam_maj_scaled: number;
          beam_min_scaled: number;
          beam_pa: number;
        }
      ];
      subbands: any[];
    };
  };
  weightingLine: {
    status: string;
    data: {
      weighting_factor: number;
      sbs_conv_factor: number[];
      confusion_noise: {
        value: number[];
        limit_type: string[];
      };
      beam_size: [
        {
          beam_maj_scaled: number;
          beam_min_scaled: number;
          beam_pa: number;
        }
      ];
      subbands: any[];
    };
  };
};
