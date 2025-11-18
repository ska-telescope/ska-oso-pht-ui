import { ValueUnitPair } from './valueUnitPair';
import { ArrayDetailsLowBackend, ArrayDetailsMidBackend } from './arrayDetails';
import { SuppliedBackend } from './supplied';
// import { ElevationBackend } from './Elevation';

export type ObservationSetBackend = {
  observation_set_id: string;
  group_id?: string;
  observing_band: string;
  // elevation?: ElevationBackend; // TODO: use this once latest PDM changes merged
  elevation?: number;
  array_details: ArrayDetailsLowBackend | ArrayDetailsMidBackend;
  observation_type_details: ObservationTypeDetailsBackend;
};

export type ObservationTypeDetailsBackend = {
  observation_type?: string;
  bandwidth: ValueUnitPair;
  central_frequency: ValueUnitPair;
  supplied: SuppliedBackend | null;
  spectral_resolution?: string;
  effective_resolution?: string;
  image_weighting: string;
  spectral_averaging?: string; //TODO: patch release pdm using int
  robust?: string; //TODO: patch release pdm using int
  number_of_channels?: number;
  pst_mode?: string; // "flow through" | "detected filterbank" | "pulsar timing"
};
