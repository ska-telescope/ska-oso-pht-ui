import GetCalibratorList from '@services/axios/get/getCalibratorList/getCalibratorList';
import { AxiosAuthClient } from '@services/axios/axiosAuthClient/axiosAuthClient';
import { REFERENCE_COORDINATE_TYPE_SSO } from '@/utils/constants';
import { generateCalibrationId } from '@/utils/helpers';
import { CalibrationStrategy, Calibrator } from '@/utils/types/calibrationStrategy';
import Observation from '@/utils/types/observation';
import Target from '@/utils/types/target';

// Calibration operations: everything that creates or replaces a calibration strategy, including
// the calibrator lookup. Kept apart from the calibrationStrategy slice so its mappers stay free
// of service calls.

/**
 * Looks up the calibrators for a target observed by an observation. There are none for a solar
 * system object, without an observation, or when the lookup fails.
 */
const lookupCalibrators = async (
  authAxiosClient: AxiosAuthClient,
  observation: Observation | undefined,
  target: Target
): Promise<Calibrator[] | null> => {
  if (target.kind === REFERENCE_COORDINATE_TYPE_SSO.value || !observation) {
    return null;
  }
  const response = await GetCalibratorList(authAxiosClient, observation, target);
  return typeof response === 'string' ? null : response;
};

/**
 * A new observatory-defined calibration strategy for an observation of a target, with its
 * calibrators looked up. `observation` can be left out when it isn't known, giving a strategy
 * without calibrators.
 */
export const buildCalibrationStrategy = async (
  authAxiosClient: AxiosAuthClient,
  {
    observationId,
    observation,
    target,
    notes = null
  }: {
    observationId: string;
    observation?: Observation;
    target: Target;
    notes?: string | null;
  }
): Promise<CalibrationStrategy> => ({
  observatoryDefined: true,
  id: generateCalibrationId(),
  observationIdRef: observationId,
  calibrators: await lookupCalibrators(authAxiosClient, observation, target),
  notes
});

/** The strategies with the one for the given strategy's observation replaced by it. */
export const withCalibrationFor = (
  strategies: CalibrationStrategy[],
  strategy: CalibrationStrategy
): CalibrationStrategy[] => [
  ...strategies.filter((cal) => cal.observationIdRef !== strategy.observationIdRef),
  strategy
];

/** The notes already given for an observation's calibration, so a new strategy keeps them. */
export const calibrationNotesFor = (strategies: CalibrationStrategy[], observationId: string) =>
  strategies.find((cal) => cal.observationIdRef === observationId)?.notes ?? null;
