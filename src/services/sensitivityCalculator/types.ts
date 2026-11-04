/****************** request ******************/

export type ICRSCoordinate = {
  kind: 'icrs';
  ra_str: string;
  dec_str: string;
};

export type GalacticCoordinate = {
  kind: 'galactic';
  l: number;
  b: number;
};

export type ReferenceCoordinate = ICRSCoordinate | GalacticCoordinate;

export type WeightingMode = 'natural' | 'robust' | 'uniform';

export type MidRxBand = 'Band 1' | 'Band 2' | 'Band 3' | 'Band 4' | 'Band 5a' | 'Band 5b';

/** Either a named subarray or a custom number of stations, never both. */
type LowArray = { subarray_configuration?: string; num_stations?: number };

/** Either a named subarray or custom antenna numbers, never both. */
type MidArray = { subarray_configuration?: string; n_ska?: number; n_meer?: number };

type Weighting = {
  weighting_mode: WeightingMode;
  robustness?: number;
};

type LowCommon = LowArray &
  Weighting & {
    integration_time_h: number;
    elevation_limit: number;
    reference_coordinates: ReferenceCoordinate[];
  };

export type LowContinuumRequest = LowCommon & {
  freq_centre_mhz: number;
  bandwidth_mhz: number;
  spectral_averaging_factor: number;
  n_subbands: number;
};

export type LowZoomRequest = LowCommon & {
  freq_centres_mhz: number[];
  spectral_resolutions_hz: number[];
  total_bandwidths_khz: number[];
};

type MidCommon = MidArray &
  Weighting & {
    rx_band: MidRxBand;
    integration_time_s: number;
    taper: number;
    el: number;
    reference_coordinates: ReferenceCoordinate[];
  };

export type MidContinuumRequest = MidCommon & {
  freq_centre_hz: number;
  bandwidth_hz: number;
  spectral_averaging_factor: number;
  n_subbands: number;
};

export type MidZoomRequest = MidCommon & {
  freq_centres_hz: number[];
  spectral_resolutions_hz: number[];
  total_bandwidths_hz: number[];
};

/****************** response ******************/

// Only the transformed results are modelled, as they are all the PHT reads. The responses also
// contain `calculate` and `weighting` blocks, and sub-band and spectropolarimetry results.

export type Quantity = { value: number; unit: string };

export type BeamSize = { beam_maj: Quantity; beam_min: Quantity };

type SpectralResults = {
  weighted_spectral_sensitivity: Quantity;
  spectral_confusion_noise: Quantity;
  total_spectral_sensitivity: Quantity;
  spectral_synthesized_beam_size: BeamSize;
  spectral_surface_brightness_sensitivity: Quantity;
};

export type ContinuumResult = SpectralResults & {
  weighted_continuum_sensitivity: Quantity;
  continuum_confusion_noise: Quantity;
  total_continuum_sensitivity: Quantity;
  continuum_synthesized_beam_size: BeamSize;
  continuum_surface_brightness_sensitivity: Quantity;
};

export type ZoomResult = SpectralResults;

/** Response body: one item per reference coordinate in the request. The PHT always sends one. */
export type ContinuumResponse = { transformed_result: ContinuumResult }[];

/** Response body: one item per reference coordinate in the request, with one result per zoom
 * window. The PHT always sends one coordinate and one zoom window. */
export type ZoomResponse = { transformed_result: ZoomResult[] }[];
