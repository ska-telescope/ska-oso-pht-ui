import { CalibratorBackend } from '@/utils/types/calibrationStrategy';

export const MockCalibratorBackendList: CalibratorBackend[] = [
  {
    calibration_intent: 'Flux',
    name: 'PKS 1934-638',
    duration_min: 10,
    choice: 'Highest elevation',
    notes: 'Flux/BP on PKS 1934-638, 15-min phase cycle.'
  }
];
