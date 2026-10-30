import { applySensCalcPatches, SensCalcPatch } from '@/utils/update/sensCalc/updateSensCalc';
import TargetObservation from '@/utils/types/targetObservation';
import type { ProposalFormAccess } from './proposal';

// Operations on the target-observation links. Kept apart from the targetObservation slice so its
// mappers stay free of the form.

/**
 * Writes sensitivity results to the links they belong to, changing nothing but their sensCalc.
 * The patches are applied to the links as they are now, so links changed while the results were
 * being calculated are kept. The form is left alone when no link is patched.
 *
 * This is the one way sensitivity results reach the form; the shared sensitivity service
 * (BTN-3595) is meant to write through it too.
 */
export const patchSensCalcResults = (form: ProposalFormAccess, patches: SensCalcPatch[]) => {
  const links = (form.getValues('targetObservation') ?? []) as TargetObservation[];
  const patched = applySensCalcPatches(links, patches) ?? links;
  if (patched.some((link, index) => link !== links[index])) {
    form.setValue('targetObservation', patched);
  }
};
