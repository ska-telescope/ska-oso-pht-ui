import TargetObservation from '@utils/types/targetObservation.tsx';
import { CalibrationStrategy } from '@utils/types/calibrationStrategy.tsx';
import type { ProposalFormAccess } from '@/models/proposals/proposal';
import Target from '../types/target';

/**
 * Removes a target and its results and calibration strategy from the form, which owns them.
 */
export default function deleteAutoLinking(target: Target, form: ProposalFormAccess) {
  const targetObservation = form.getValues('targetObservation') as TargetObservation[];
  const calibrationStrategy = form.getValues('calibrationStrategy') as CalibrationStrategy[];

  // the calibration strategy goes with the observation the target was linked to
  const obsId = targetObservation?.find((e) => e.targetId === target?.id)?.observationId;

  form.setValue(
    'targets',
    (form.getValues('targets') ?? []).filter((e) => e.id !== target?.id)
  );
  form.setValue(
    'targetObservation',
    (targetObservation ?? []).filter((e) => e.targetId !== target?.id)
  );
  form.setValue(
    'calibrationStrategy',
    (calibrationStrategy ?? []).filter((e) => e.observationIdRef !== obsId)
  );
}
