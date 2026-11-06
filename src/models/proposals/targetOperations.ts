import Target from '@utils/types/target';
import { getFormCalibration, getFormLinks, getFormTargets } from './formSlices';
import type { ProposalFormAccess } from './proposal';

// Operations on the proposal's targets that change other slices too. Kept apart from the targets
// slice so its mappers stay free of the form.

/**
 * Removes a target from the form, with its links and the calibration strategy of the observation
 * it was linked to.
 */
export const removeTarget = (form: ProposalFormAccess, target: Target) => {
  const links = getFormLinks(form);
  const observationId = links.find((link) => link.targetId === target.id)?.observationId;

  form.setValue(
    'targets',
    getFormTargets(form).filter((e) => e.id !== target.id)
  );
  form.setValue(
    'targetObservation',
    links.filter((link) => link.targetId !== target.id)
  );
  form.setValue(
    'calibrationStrategy',
    getFormCalibration(form).filter((cal) => cal.observationIdRef !== observationId)
  );
};
