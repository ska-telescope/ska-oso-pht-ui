export type ArrayDetailsLowBackend = {
  array: string;
  subarray?: string;
  number_of_stations?: number;
  spectral_averaging?: string;
};

export type ArrayDetailsMidBackend = {
  array: string;
  subarray?: string;
  weather?: number;
  elevation?: number; // TODO remove elevation from ArrayDetail once new ODA released
  number_15_antennas?: number;
  number_13_antennas?: number;
  number_sub_bands?: number;
  tapering?: string;
  spectral_averaging?: string;
};