import type {
  CalibratorChoice,
  CalibrationWhen,
  Target as TargetTransport
} from '@/generated/models';
export type CalibrationIntent = 'flux'; // this will eventually be extended with '| "amplitude" | "phase"' too
export type RelativeToScan = CalibrationWhen;
export type SelectionStrategy = CalibratorChoice;

// this is what is returned by the API call to the calibrator endpoint
export type CalibratorBackend = {
  calibrator: TargetTransport;
  when: RelativeToScan;
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
