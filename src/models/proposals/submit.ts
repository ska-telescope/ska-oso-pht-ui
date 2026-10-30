import { STATUS_ERROR, STATUS_OK } from '@/utils/constants';
import phtTranslations from '../../../public/locales/en/pht.json';
import { getProposalSchema, ProposalType } from './proposal';
import { getTargetsSchema } from './targets';
import { getTargetObservationSchema } from './targetObservation';
import { getCalibrationStrategySchema } from './calibrationStrategy';

// The submit schema: the proposal form schema plus the rules a proposal must meet before it can
// be submitted. They are kept out of the form's own schema, which validates as the user types, so
// an unfinished proposal (e.g. a new one with no targets yet) is not marked invalid.
//
// Each rule is attached to its slice rather than added in a root refinement, so it is still
// checked when another slice (e.g. the title) has errors. The rules match the page checks they
// replace in validation.tsx.
//
// TODO(BTN-3595): Rules that need the observations and data products (every observation linked to
// a target, data product compatibility, hidden companion data products) are added once they move
// to the form.
export function getProposalSubmitSchema() {
  return getProposalSchema().extend({
    targets: getTargetsSchema().min(1, phtTranslations.targets.empty),
    targetObservation: getTargetObservationSchema().min(
      1,
      phtTranslations.error.noCalibrationsLinking
    ),
    calibrationStrategy: getCalibrationStrategySchema().min(
      1,
      phtTranslations.error.noCalibrationsLoggedOut
    )
  });
}

/** The pages whose status comes from the submit schema, by the form slice each one edits. */
export const SUBMIT_PAGE_SLICES = {
  target: 'targets',
  linking: 'targetObservation',
  calibration: 'calibrationStrategy'
} as const;

export type SubmitPage = keyof typeof SUBMIT_PAGE_SLICES;

/** The status of each of those pages: an error when the submit schema reports an issue in it. */
export const getSubmitPageStatuses = (values: ProposalType): Record<SubmitPage, number> => {
  const issues = getProposalSubmitSchema().safeParse(values).error?.issues ?? [];
  const hasIssue = (slice: string) => issues.some((issue) => issue.path[0] === slice);
  return {
    target: hasIssue(SUBMIT_PAGE_SLICES.target) ? STATUS_ERROR : STATUS_OK,
    linking: hasIssue(SUBMIT_PAGE_SLICES.linking) ? STATUS_ERROR : STATUS_OK,
    calibration: hasIssue(SUBMIT_PAGE_SLICES.calibration) ? STATUS_ERROR : STATUS_OK
  };
};
