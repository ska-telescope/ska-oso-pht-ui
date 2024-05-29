import { ValueUnitPair } from './valueUnitPair';

export type ObservationSetBackend = {
  observation_set_id: string;
  group_id?: string;
  observing_band?: string;
  array_details?: {
    array: string;
    subarray?: string;
    weather?: number;
    number_15_antennas?: number;
    number_13_antennas?: number;
    number_sub_bands?: number;
    elevation?: number;
    tapering?: string;
  };
  observation_type_details: {
    observation_type: string;
    bandwidth: ValueUnitPair;
    central_frequency: ValueUnitPair;
    supplied: {
      type: string;
      value: number;
      unit: string;
    };
    spectral_resolution: string;
    effective_resolution: string;
    image_weighting: string;
  };
  details: string;
};
