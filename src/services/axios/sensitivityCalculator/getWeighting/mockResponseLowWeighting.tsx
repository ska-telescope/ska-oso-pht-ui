export const MockQuerryLowWeightingContinuum = {
  spectral_mode: 'line',
  weighting_mode: 'uniform',
  subarray_configuration: 'LOW_AA4_all',
  pointing_centre: '00:00:00.0 00:00:00.0',
  freq_centre_mhz: '200'
};

export const MockQuerryLowWeightingLineZoom = {
  weighting_mode: 'uniform',
  subarray_configuration: 'LOW_AA4_all',
  pointing_centre: '00:00:00.0 00:00:00.0',
  freq_centres_mhz: '200'
};

export const MockQuerryLowWeightingLineSpectral = {
  spectral_mode: 'line',
  weighting_mode: 'uniform',
  subarray_configuration: 'LOW_AA4_all',
  pointing_centre: '00:00:00.0 00:00:00.0',
  freq_centre_mhz: '200'
};

/*
The response here is used in the sensitivity calculator. Some results are used directly like the confusion noise, 
and some are combined and used for some calculations in the front-end.
*/

export const MockResponseLowWeightingContinuum = {
  weighting_factor: 15.176737500353465,
  sbs_conv_factor: [2598892.1330005163],
  confusion_noise: {
    value: [1.03538377754085e-6],
    limit_type: ['value']
  },
  beam_size: [
    {
      beam_maj_scaled: 0.0010792161880542248,
      beam_min_scaled: 0.0008405281736775013,
      beam_pa: 190.60129457149282
    }
  ]
};

export const MockResponseLowWeightingLineZoom = [
  {
    freq_centre: {
      value: 200000000.0,
      unit: 'Hz'
    },
    weighting_factor: 12.696037725198487,
    sbs_conv_factor: 1035304.4396926606,
    confusion_noise: {
      value: 3.549738945339684e-6,
      limit_type: 'value'
    },
    beam_size: {
      beam_maj_scaled: 0.0016339516370391025,
      beam_min_scaled: 0.0013936114519620306,
      beam_pa: 17.87816543466122
    }
  }
];

export const MockResponseLowWeightingLineSpectral = {
  weighting_factor: 12.696037725198487,
  sbs_conv_factor: [1035304.4396926606],
  confusion_noise: {
    value: [3.549738945339684e-6],
    limit_type: ['value']
  },
  beam_size: [
    {
      beam_maj_scaled: 0.0016339516370391025,
      beam_min_scaled: 0.0013936114519620306,
      beam_pa: 17.878165434661216
    }
  ]
};
