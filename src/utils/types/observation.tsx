type Observation = {
  id: number;
  telescope: number;
  subarray: number;
  linked: string;
  type: number;
  observing_band: number;
  weather?: number; // only for MID
  elevation: number;
  central_frequency: string;
  bandwidth: number;
  spectral_averaging?: number; // only for LOW
  tapering?: number; // only for MID
  image_weighting: number;
  integration_time: string;
  integration_time_units: number;
  // continuum_bandwidth?: number; // used where? => same as bandwidth
  spectral_resolution: number;
  effective_resolution: number;
  number_of_sub_bands?: number; // only for MID
  number_of_15m_antennas?: number;
  number_of_13m_antennas?: number;
  number_of_stations?: number;
  details: string;
  // TODO: get right ascension + declination from target => store in target and send it as pointing_centre: '00:00:00.0 00:00:00.0',
};

export default Observation;
