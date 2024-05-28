import { ValueUnitPair } from './valueUnitPair';

export type ResultBackend = {
        observation_set_ref: string;
        target_ref: string;
        result_details: {
            supplied_type: string;
            weighted_continuum_sensitivity: ValueUnitPair;
            weighted_spectral_sensitivity: ValueUnitPair;
            total_continuum_sensitivity: ValueUnitPair;
            total_spectral_sensitivity: ValueUnitPair;
            surface_brightness_sensitivity: {
                continuum: string;
                spectral: number;
                unit: string;
            }
        };
        continuum_confusion_noise: ValueUnitPair;
        synthesized_beam_size: ValueUnitPair;
        spectral_confusion_noise: ValueUnitPair;
    };