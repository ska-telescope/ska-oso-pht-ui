import Proposal from '@utils/types/proposal';
import Target from '@utils/types/target';
import TargetObservation from '@utils/types/targetObservation';
import { CalibrationStrategy } from '@utils/types/calibrationStrategy';
import type { ProposalFormAccess } from './proposal';

// The form's targets, links and calibration, read as the legacy types the pages still work with.
// The casts go once the pages use the slice types directly.

type FormReader = Pick<ProposalFormAccess, 'getValues'>;

export const getFormTargets = (form: FormReader) => (form.getValues('targets') ?? []) as Target[];

export const getFormLinks = (form: FormReader) =>
  (form.getValues('targetObservation') ?? []) as TargetObservation[];

export const getFormCalibration = (form: FormReader) =>
  (form.getValues('calibrationStrategy') ?? []) as CalibrationStrategy[];

/** The proposal with the form's targets and links, for code that still takes a whole proposal. */
export const withFormSlices = (proposal: Proposal, form: FormReader): Proposal => ({
  ...proposal,
  targets: getFormTargets(form),
  targetObservation: getFormLinks(form)
});
