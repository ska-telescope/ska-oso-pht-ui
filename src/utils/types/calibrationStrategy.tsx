// not used yet as we only use observatory defined at the moment
export type CalibratorBackend = {
  kind: string; // 'flux' | 'amplitude' | 'phase'
  name: string;
  model_config: string;
  notes: string | null;
};

export type CalibrationStrategyBackend = {
  observatory_defined: boolean;
  calibration_id: string;
  observation_id_ref: string;
  calibrators: CalibratorBackend[] | null; // null for observatory defined
  notes: string | null;
};

// not used yet as we only use observatory defined at the moment
export type Calibrator = {
  kind: string; // 'flux' | 'amplitude' | 'phase'
  name: string;
  modelConfig: string;
  notes: string | null;
};

export type CalibrationStrategy = {
  observatoryDefined: boolean;
  id: string;
  observationIdRef: string;
  calibrators: Calibrator[] | null; // null for observatory defined
  notes: string | null;
};
