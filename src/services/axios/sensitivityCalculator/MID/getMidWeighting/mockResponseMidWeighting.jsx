export const MockQuerryMidWeightingContinuum =
{
frequency: '797500000',
zoom_frequencies: '797500000',
dec_str: '00:00:00.0',
weighting: 'uniform',
array_configuration: 'AA4',
calculator_mode: 'continuum',
taper: '0'
}

export const MockQuerryMidWeightingLine =
{
frequency: '797500000',
zoom_frequencies: '797500000',
dec_str: '00:00:00.0',
weighting: 'uniform',
array_configuration: 'AA4',
calculator_mode: 'line',
taper: '0'
}

/*
The response here is used in the sensitivity calculator. Some are used directly like the confusion noise, 
and some result are combined and used for some calculations in the front-end.
*/

export const MockResponseMidWeightingContinuum = {
  status: 'success',
  data: {
    weighting_factor: 13.065102884908521,
    sbs_conv_factor: [14563138.558077352],
    confusion_noise: {
      value: [0.0],
      limit_type: ['value']
    },
    beam_size: [
      {
        beam_maj_scaled: 0.00010671288004375412,
        beam_min_scaled: 9.540601712053661e-5,
        beam_pa: 232.42950376471578
      }
    ],
    subbands: []
  }
};

export const MockResponseMidWeightingLine =
{
    "status": "success",
    "data": {
        "weighting_factor": 6.791850079637303,
        "sbs_conv_factor": [
            5626110.984777281
        ],
        "confusion_noise": {
            "value": [
                0.0
            ],
            "limit_type": [
                "value"
            ]
        },
        "beam_size": [
            {
                "beam_maj_scaled": 0.00017240449664253948,
                "beam_min_scaled": 0.00015285889104342477,
                "beam_pa": 43.447752922342616
            }
        ],
        "subbands": []
    }
}
