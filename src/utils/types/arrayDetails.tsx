export type ArrayDetailsLowBackend = {
  array: string;
  subarray?: string;
  number_of_stations?: number;
  spectral_averaging?: string;
  numSubBands ?: number;
};

export type ArrayDetailsMidBackend = {
  array: string;
  subarray?: string;
  weather?: number;
  number_15_antennas?: number;
  number_13_antennas?: number;
  number_sub_bands?: number;
  tapering?: string;
  spectral_averaging?: string;
};
