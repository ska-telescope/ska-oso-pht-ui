import { ValueUnitPair } from './valueUnitPair';
import { ArrayDetailsLowBackend, ArrayDetailsMidBackend } from './arrayDetails';
import { Supplied } from './supplied';

export type ObservationSetBackend = {
  observation_set_id: string;
  group_id?: string;
  observing_band?: string;
  array_details?: ArrayDetailsLowBackend[] | ArrayDetailsMidBackend[];
  observation_type_details?: ObservationTypeDetailsBackend;
  details: string;
};

export type ObservationTypeDetailsBackend = {
  observation_type?: string;
  bandwidth?: ValueUnitPair;
  central_frequency?: ValueUnitPair;
  supplied?: Supplied;
  spectral_resolution?: string;
  effective_resolution?: string;
  image_weighting?: string;
};
