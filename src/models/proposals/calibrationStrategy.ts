import { z } from 'zod';
import type {
  CalibrationStrategy,
  Calibrator,
  CalibratorBackend
} from '@/utils/types/calibrationStrategy';
import {
  CalibrationWhen,
  CalibratorChoice,
  type CalibrationStrategy as CalibrationStrategyTransport,
  type FluxCal
} from '@/generated/models';

// Schema for the proposal's calibration strategies and their calibrators. Structure only: see
// getProposalSchema.

const calibratorSchema = z.object({
  targetId: z.string(),
  name: z.string(),
  calibrationIntent: z.literal('flux'),
  durationSeconds: z.number(),
  selectionStrategy: z.enum(CalibratorChoice),
  relativeToScan: z.enum(CalibrationWhen),
  notes: z.string().nullable()
});

export function getCalibrationStrategyEntrySchema() {
  return z.object({
    observatoryDefined: z.boolean(),
    id: z.string(),
    observationIdRef: z.string(),
    calibrators: z.array(calibratorSchema).nullable(),
    // The backend leaves out empty notes, so a loaded strategy can have none
    notes: z.string().nullish()
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
    selectionStrategy: CalibratorChoice.HighestElevation,
    relativeToScan: index === 0 ? CalibrationWhen.BeforeEachScan : CalibrationWhen.AfterEachScan,
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

// The calibrator lookup gives only the calibrator and when to observe it; the rest are defaults
// for now. At least the duration should eventually come from the backend.
const DEFAULT_CALIBRATION_INTENT: Calibrator['calibrationIntent'] = 'flux';
export const DEFAULT_CALIBRATOR_SELECTION: Calibrator['selectionStrategy'] =
  CalibratorChoice.HighestElevation;
const DEFAULT_CALIBRATOR_DURATION_SECS = 600;

/** A calibrator from the ODA's calibrator lookup, with the defaults for the rest of its fields. */
export const calibratorFromPdm = (data: CalibratorBackend): Calibrator => ({
  targetId: data.calibrator.target_id as string,
  name: data.calibrator.name as string,
  calibrationIntent: DEFAULT_CALIBRATION_INTENT,
  durationSeconds: DEFAULT_CALIBRATOR_DURATION_SECS,
  selectionStrategy: DEFAULT_CALIBRATOR_SELECTION,
  notes: null,
  relativeToScan: data.when
});
