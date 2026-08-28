import { TargetBackend } from '@utils/types/target.tsx';

export type CalibrationIntent = 'flux'; // this will eventually be extended with '| "amplitude" | "phase"' too
export type RelativeToScan = 'before_each_scan' | 'after_each_scan';
export type SelectionStrategy = 'highest_elevation' | 'closest';

// this is what is returned by the API call to the calibrator endpoint
export type CalibratorBackend = {
  calibrator: TargetBackend;
  when: RelativeToScan;
};

// this is what the proposal data model expects
export type FluxCalBackend = {
  kind: string;
  name: string;
};

export type CalibrationStrategyBackend = {
  observatory_defined: boolean;
  calibration_id: string;
  observation_set_ref: string;
  calibrators: FluxCalBackend[] | null;
  notes: string | null;
};

export type Calibrator = {
  targetId: string;
  name: string;
  calibrationIntent: CalibrationIntent;
  durationSeconds: number;
  selectionStrategy: SelectionStrategy;
  relativeToScan: RelativeToScan;
  notes: string | null;
};

export type CalibrationStrategy = {
  observatoryDefined: boolean;
  id: string;
  observationIdRef: string;
  calibrators: Calibrator[] | null;
  notes: string | null;
};
