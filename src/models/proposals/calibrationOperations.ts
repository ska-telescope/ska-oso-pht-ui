import { findCalibrators } from '@/services/api/calibrators';
import { generateCalibrationId } from '@/utils/helpers';
import { CalibrationStrategy, Calibrator } from '@/utils/types/calibrationStrategy';
import type { ObservationInput } from './observations';
import Target from '@/utils/types/target';

// Calibration operations: everything that creates or replaces a calibration strategy, including
// the calibrator lookup. Kept apart from the calibrationStrategy slice so its mappers stay free
// of service calls.

/**
 * Looks up the calibrators for a target observed by an observation. There are none for a solar
 * system object, or when the lookup fails.
 */
export const lookupCalibrators = async (
  observation: ObservationInput,
  target: Target
): Promise<Calibrator[] | null> => {
  // findCalibrators makes no request for a solar system object, returning an error instead
  const { data } = await findCalibrators(observation, target);
  return data ?? null;
};

/**
 * A new observatory-defined calibration strategy for an observation of a target, with its
 * calibrators looked up.
 */
export const buildCalibrationStrategy = async ({
  observation,
  target,
  notes = null
}: {
  observation: ObservationInput;
  target: Target;
  notes?: string | null;
}): Promise<CalibrationStrategy> => ({
  observatoryDefined: true,
  id: generateCalibrationId(),
  observationIdRef: observation.id,
  calibrators: await lookupCalibrators(observation, target),
  notes
});

/**
 * The strategies with the one for the given strategy's observation replaced by it. The notes
 * already there are kept: a strategy is built before its calibrator lookup, so the author may have
 * edited the notes while it ran.
 */
export const withCalibrationFor = (
  strategies: CalibrationStrategy[],
  strategy: CalibrationStrategy
): CalibrationStrategy[] => {
  const current = strategies.find((cal) => cal.observationIdRef === strategy.observationIdRef);
  return [
    ...strategies.filter((cal) => cal.observationIdRef !== strategy.observationIdRef),
    current ? { ...strategy, notes: current.notes } : strategy
  ];
};

/** The notes already given for an observation's calibration, so a new strategy keeps them. */
export const calibrationNotesFor = (strategies: CalibrationStrategy[], observationId: string) =>
  strategies.find((cal) => cal.observationIdRef === observationId)?.notes ?? null;
