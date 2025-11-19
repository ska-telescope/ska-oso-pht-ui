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
  observation_type_details:
    | ObservationTypeDetailsSpectralBackend
    | ObservationTypeDetailsContinuumBackend
    | ObservationTypeDetailsPSTBackend
    | null;
};

export type ObservationTypeDetailsSpectralBackend = {
  bandwidth: ValueUnitPair;
  central_frequency: ValueUnitPair;
  supplied: SuppliedBackend | null;
  observation_type?: string;
  spectral_resolution?: string;
  effective_resolution?: string;
  spectral_averaging?: string;
  number_of_channels?: string;
};

export type ObservationTypeDetailsContinuumBackend = {
  bandwidth: ValueUnitPair;
  central_frequency: ValueUnitPair;
  supplied: SuppliedBackend | null;
  observation_type?: string;
};

export type ObservationTypeDetailsPSTBackend = {
  bandwidth: ValueUnitPair;
  central_frequency: ValueUnitPair;
  supplied: SuppliedBackend | null;
  observation_type?: string;
  pst_mode?: string;
};
