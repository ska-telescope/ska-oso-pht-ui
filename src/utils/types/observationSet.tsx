import { ValueUnitPair } from './valueUnitPair';
import { ArrayDetailsLowBackend, ArrayDetailsMidBackend } from './arrayDetails';

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
  supplied?: {
    type: string;
    value: number;
    unit?: string;
  };
  spectral_resolution?: string;
  effective_resolution?: string;
  image_weighting?: string;
};
