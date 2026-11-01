import { CalibrationStrategy } from '@/utils/types/calibrationStrategy';

export const mockCalibration: CalibrationStrategy = {
  observatoryDefined: true,
  id: 'cal-0000000',
  observationIdRef: 'obs-123',
  calibrators: [
    {
      calibrationIntent: 'flux',
      durationSeconds: 600,
      name: '3C 444',
      notes: null,
      relativeToScan: 'before_each_scan',
      selectionStrategy: 'highest_elevation',
      targetId: 'calibrator-00001'
    },
    {
      calibrationIntent: 'flux',
      durationSeconds: 600,
      name: '3C 444',
      notes: null,
      relativeToScan: 'after_each_scan',
      selectionStrategy: 'highest_elevation',
      targetId: 'calibrator-00001'
    }
  ],
  notes: null
};
