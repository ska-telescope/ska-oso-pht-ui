import { ValueUnitPair } from './valueUnitPair';

export type SensCalcResultsBackend = {
  observation_set_ref?: string;
  target_ref?: string;
  result?: {
    supplied_type: string;
    // only for Supplied Sensitivity
    // TODO check if it's the other way around
    // ********************************** //
    weighted_continuum_sensitivity?: ValueUnitPair;
    weighted_spectral_sensitivity?: ValueUnitPair;
    total_continuum_sensitivity?: ValueUnitPair;
    total_spectral_sensitivity?: ValueUnitPair;
    surface_brightness_sensitivity?: {
      continuum?: number;
      spectral: number;
      unit: string;
    };
    // ********************************** //
    // only for Supplied Integration Time
    // ********************************** //
    continuum?: ValueUnitPair;
    spectral?: ValueUnitPair;
    // ********************************** //
  };
  continuum_confusion_noise?: ValueUnitPair;
  synthesized_beam_size?: ValueUnitPair;
  spectral_confusion_noise?: ValueUnitPair;
};

export type SensCalcResults = {
  id: number;
  title: string;
  statusGUI: number;
  error?: string;
  section1?: ResultsSection[];
  section2?: ResultsSection[];
  section3?: ResultsSection[];
};

export type ResultsSection = {
  field: string;
  value: string;
  units?: string;
};
