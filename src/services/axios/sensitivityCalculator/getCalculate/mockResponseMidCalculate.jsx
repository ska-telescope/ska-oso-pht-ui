export const MockQueryMidCalculate = {
  rx_band: 'Band 1',
  ra_str: '00:00:00.0',
  dec_str: '00:00:00.0',
  array_configuration: 'AA4',
  pwv: '10',
  el: '45',
  frequency: '797500000',
  bandwidth: '435000000',
  n_subbands: '1',
  resolution: '13440',
  weighting: 'uniform',
  calculator_mode: 'continuum',
  taper: '0',
  integration_time: '600',
  integration_time_units: 'd'
};

export const MockQueryMidCalculateZoom = {
  rx_band: 'Band 1',
  ra_str: '00:00:00.0',
  dec_str: '00:00:00.0',
  array_configuration: 'AA4',
  pwv: '10',
  el: '45',
  frequency: '797500000',
  bandwidth: '210',
  zoom_frequencies: '797500000',
  zoom_resolutions: '210',
  weighting: 'uniform',
  calculator_mode: 'line',
  taper: '0',
  integration_time: '600',
  integration_time_units: 'd'
};

export const MockResponseMidCalculate = {
  status: 'success',
  data: {
    result: {
      state: {
        pwv: 10.0,
        eta_system: 0.978951648899818,
        eta_pointing: 0.9999843606651253,
        eta_coherence: 0.9999458226511467,
        eta_digitisation: 0.999,
        eta_correlation: 0.98,
        eta_bandpass: 1.0,
        n_ska: 133,
        eta_ska: 0.7255688335416156,
        n_meer: 64,
        eta_meer: 0.7255688335416156,
        alpha: 2.75,
        frequency: 797500000.0,
        bandwidth: 435000000.0,
        t_sys_ska: 27.396893310543984,
        t_spl_ska: 3.0,
        t_rx_ska: 15.0676875,
        t_sys_meer: 23.35558443189509,
        t_spl_meer: 4.0,
        t_rx_meer: 10.021249999999998,
        t_sky_ska: 9.348338339624355,
        t_sky_meer: 9.353466191138867,
        t_gal_ska: 2.8593475162027477,
        t_gal_meer: 2.864511755602034,
        el: 45.0,
        rx_band: 'Band 1',
        array_configuration: 'AA4',
        target: '0:00:00 0:00:00'
      },
      sensitivity: 4.251275922660714e-6,
      line_sensitivity: 0.0007648288952462656
    }
  }
};

export const MockResponseMidCalculateZoom = {
  status: 'success',
  data: {
    result: {
      state: {
        pwv: 10.0,
        eta_system: 0.978951648899818,
        eta_pointing: 0.9999843606651253,
        eta_coherence: 0.9999458226511467,
        eta_digitisation: 0.999,
        eta_correlation: 0.98,
        eta_bandpass: 1.0,
        n_ska: 133,
        eta_ska: 0.7255688335416156,
        n_meer: 64,
        eta_meer: 0.7255688335416156,
        alpha: 2.75,
        frequency: 797500000.0,
        bandwidth: 210.0,
        t_sys_ska: 27.396893310543984,
        t_spl_ska: 3.0,
        t_rx_ska: 15.0676875,
        t_sys_meer: 23.35558443189509,
        t_spl_meer: 4.0,
        t_rx_meer: 10.021249999999998,
        t_sky_ska: 9.348338339624355,
        t_sky_meer: 9.353466191138867,
        t_gal_ska: 2.8593475162027477,
        t_gal_meer: 2.864511755602034,
        el: 45.0,
        rx_band: 'Band 1',
        array_configuration: 'AA4',
        target: '0:00:00 0:00:00'
      },
      sensitivity: 0.006118631161970125
    },
    zooms: [
      {
        state: {
          pwv: 10.0,
          eta_system: 0.978951648899818,
          eta_pointing: 0.9999843606651253,
          eta_coherence: 0.9999458226511467,
          eta_digitisation: 0.999,
          eta_correlation: 0.98,
          eta_bandpass: 1.0,
          n_ska: 133,
          eta_ska: 0.7255688335416156,
          n_meer: 64,
          eta_meer: 0.7255688335416156,
          alpha: 2.75,
          frequency: 797500000.0,
          bandwidth: 210.0,
          t_sys_ska: 27.396893310543984,
          t_spl_ska: 3.0,
          t_rx_ska: 15.0676875,
          t_sys_meer: 23.35558443189509,
          t_spl_meer: 4.0,
          t_rx_meer: 10.021249999999998,
          t_sky_ska: 9.348338339624355,
          t_sky_meer: 9.353466191138867,
          t_gal_ska: 2.8593475162027477,
          t_gal_meer: 2.864511755602034,
          el: 45.0,
          rx_band: 'Band 1',
          array_configuration: 'AA4',
          target: '0:00:00 0:00:00'
        },
        sensitivity: 0.006118631161970125
      }
    ]
  }
};
