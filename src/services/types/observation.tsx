type Observation = {
  id: number;
  telescope: number;
  subarray: number;
  type: number;
};

export default Observation;

type ObservationNew = {
  id: number;
  telescope: number;
  subarray: number;
  type: number;
  observing_band: string;
  weather?: number; // only for MID
  elevation: number;
  central_frequency: number;
  bandwidth: number;
  spectral_averaging?: number; // only for LOW
  tapering?: number; // only for MID
  image_weighting: string;
  integration_time: number;
  // continuum_bandwidth?: number; // used where? => same as bandwidth
  spectral_resolution: number;
  effective_resolution: number; // only for LOW Zoom? check MID Zoom => float?
  number_of_sub_bands?: number; // only for MID
  // TODO: get right ascension + declination from target => store in target and send it as pointing_centre: '00:00:00.0 00:00:00.0',
};
