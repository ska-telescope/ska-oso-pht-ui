import { z } from 'zod';
import type { CalibrationStrategy, Calibrator } from '@/utils/types/calibrationStrategy';
import type {
  CalibrationStrategy as CalibrationStrategyTransport,
  FluxCal
} from '@/generated/models';

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

/*********************************************************** PDM mapping *********************************************************/

/**************************** PDM → form *****************************/

function fluxCalToCalibrator(data: FluxCal, index: number): Calibrator {
  return {
    targetId: '',
    name: data.name,
    calibrationIntent: 'flux',
    durationSeconds: 600,
    selectionStrategy: 'highest_elevation',
    relativeToScan: index === 0 ? 'before_each_scan' : 'after_each_scan',
    notes: null
  };
}

export const calibrationStrategyFromPdm = (
  inValue: CalibrationStrategyTransport[] | null | undefined
): CalibrationStrategy[] => {
  return inValue
    ? inValue.map((strategy) => ({
        observatoryDefined: strategy?.observatory_defined,
        id: strategy?.calibration_id as unknown as string,
        observationIdRef: strategy?.observation_set_ref as unknown as string,
        calibrators: strategy?.calibrators
          ? (strategy.calibrators as unknown as FluxCal[]).map((calibrator, index) =>
              fluxCalToCalibrator(calibrator, index)
            )
          : null,
        notes: strategy.notes as unknown as string | null
      }))
    : [];
};

/**************************** form → PDM *****************************/

type CalibratorEntry = NonNullable<CalibrationStrategyType[number]['calibrators']>[number];

function calibratorToFluxCal(calibrator: CalibratorEntry): FluxCal {
  return {
    kind: 'flux',
    name: calibrator.name
  };
}

export const calibrationStrategyToPdm = (
  calibrationStrategies: CalibrationStrategyType
): CalibrationStrategyTransport[] => {
  return calibrationStrategies?.map(
    (strategy) =>
      ({
        observatory_defined: strategy?.observatoryDefined,
        calibration_id: strategy?.id,
        observation_set_ref: strategy?.observationIdRef,
        calibrators: strategy?.calibrators ? strategy.calibrators.map(calibratorToFluxCal) : null,
        notes: strategy?.notes
      }) as CalibrationStrategyTransport
  );
};
