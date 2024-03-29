type Observation = {
  id: number;
  telescope: number;
  subarray: number;
  linked: string;
  type: number;
  observing_band: number;
  weather?: string; // only for MID
  elevation: string;
  central_frequency: string;
  bandwidth: number;
  spectral_averaging?: number; // only for LOW
  tapering?: number; // only for MID
  image_weighting: number;
  integration_time: string;
  // continuum_bandwidth?: number; // used where? => same as bandwidth
  spectral_resolution: number;
  effective_resolution: number;
  number_of_sub_bands?: number; // only for MID
  // TODO: get right ascension + declination from target => store in target and send it as pointing_centre: '00:00:00.0 00:00:00.0',
};

export default Observation;
