import { z } from 'zod';
import { STATUS_ERROR, STATUS_OK } from '@/utils/constants';
import phtTranslations from '../../../public/locales/en/pht.json';
import { getProposalSchema, ProposalType } from './proposal';
import { getTargetsSchema } from './targets';
import { getTargetObservationSchema } from './targetObservation';
import { getCalibrationStrategySchema } from './calibrationStrategy';

/** The pages whose status comes from the submit schema. */
export type SubmitPage = 'target' | 'linking' | 'calibration';

type SubmitTag = { page: SubmitPage };

/**
 * Tags a submit rule's issue with the page whose status it sets, so the status comes from which
 * rule failed rather than from where or how Zod reports it.
 */
const submitRule = (page: SubmitPage, message: string) => ({
  message,
  params: { page } satisfies SubmitTag
});

/** Whether one of the issues comes from a submit rule for the page. */
const hasSubmitBlocker = (issues: z.core.$ZodIssue[], page: SubmitPage) =>
  issues.some(
    (issue) => issue.code === 'custom' && (issue.params as SubmitTag | undefined)?.page === page
  );

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
    targets: getTargetsSchema().refine(
      (targets) => targets.length > 0,
      submitRule('target', phtTranslations.targets.empty)
    ),
    targetObservation: getTargetObservationSchema().refine(
      (links) => links.length > 0,
      submitRule('linking', phtTranslations.error.noCalibrationsLinking)
    ),
    calibrationStrategy: getCalibrationStrategySchema().refine(
      (strategies) => strategies.length > 0,
      submitRule('calibration', phtTranslations.error.noCalibrationsLoggedOut)
    )
  });
}

/**
 * The status of each of those pages: an error when one of its submit rules fails.
 *
 * Only the issues tagged by submitRule count. Problems inside an entry (the structure checks) are
 * left out, so the status follows the page checks it replaced and nothing more.
 */
export const getSubmitPageStatuses = (values: ProposalType): Record<SubmitPage, number> => {
  const issues = getProposalSubmitSchema().safeParse(values).error?.issues ?? [];
  const status = (page: SubmitPage) => (hasSubmitBlocker(issues, page) ? STATUS_ERROR : STATUS_OK);
  return {
    target: status('target'),
    linking: status('linking'),
    calibration: status('calibration')
  };
};
