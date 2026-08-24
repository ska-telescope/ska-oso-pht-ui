import { Calibrator } from '@/utils/types/calibrationStrategy';

export const MockCalibratorFrontendList: Calibrator[] = [
  {
    "calibrationIntent": "flux",
    "durationSeconds": 600,
    "name": "3C 444",
    "relativeToScan": "before_each_scan",
    "selectionStrategy": "highest_elevation",
    "targetId": "calibrator-00001",
    "notes": null,
  },
    {
    "calibrationIntent": "flux",
    "durationSeconds": 600,
    "name": "3C 444",
    "relativeToScan": "after_each_scan",
    "selectionStrategy": "highest_elevation",
    "targetId": "calibrator-00001",
    "notes": null,
  }
];
