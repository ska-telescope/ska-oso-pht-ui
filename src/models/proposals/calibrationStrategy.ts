import { z } from 'zod';

// Schema for the proposal's calibration strategies and their calibrators. Structure only: see
// getProposalSchema.

const calibratorSchema = z.object({
  targetId: z.string(),
  name: z.string(),
  calibrationIntent: z.literal('flux'),
  durationSeconds: z.number(),
  selectionStrategy: z.enum(['highest_elevation', 'closest']),
  relativeToScan: z.enum(['before_each_scan', 'after_each_scan']),
  notes: z.string().nullable()
});

export function getCalibrationStrategyEntrySchema() {
  return z.object({
    observatoryDefined: z.boolean(),
    id: z.string(),
    observationIdRef: z.string(),
    calibrators: z.array(calibratorSchema).nullable(),
    notes: z.string().nullable()
  });
}

export function getCalibrationStrategySchema() {
  return z.array(getCalibrationStrategyEntrySchema());
}

export type CalibrationStrategyType = z.input<ReturnType<typeof getCalibrationStrategySchema>>;
