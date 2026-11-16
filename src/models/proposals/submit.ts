import { PROPOSAL_TYPE, SENSITIVITY_STATE, STATUS_ERROR, STATUS_OK } from '@/utils/constants';
import phtTranslations from '../../../public/locales/en/pht.json';
import { getProposalSchema, ProposalType } from './proposal';
import { getTargetsSchema } from './targets';
import { getTargetObservationSchema } from './targetObservation';
import { getCalibrationStrategySchema } from './calibrationStrategy';
import { getDataProductsSchema } from './dataProducts';

/** The pages whose status comes from the submit schema. */
export type SubmitPage = 'target' | 'linking' | 'calibration' | 'dataProducts';

// The form subgroup each page edits: an issue anywhere in the subgroup marks the page
const PAGE_SUBGROUP = {
  target: 'targets',
  linking: 'targetObservation',
  calibration: 'calibrationStrategy',
  dataProducts: 'dataProducts'
} as const satisfies Record<SubmitPage, keyof ProposalType>;

// The submit schema: the proposal form schema plus the rules a proposal must meet before it can
// be submitted. They are kept out of the form's own schema, which validates as the user types, so
// an unfinished proposal (e.g. a new one with no targets yet) is not marked invalid.
//
// Each rule is attached to its subgroup, so its issue is reported in the subgroup. A rule that
// spans several subgroups is a root refinement, given the path of the subgroup whose page it
// marks.
//
// TODO(BTN-3595): Rules that need the observations (every observation linked to a target, data
// product compatibility, hidden companion data products) are added once they move to the form.
export function getProposalSubmitSchema() {
  return (
    getProposalSchema()
      .extend({
        targets: getTargetsSchema().refine(
          (targets) => targets.length > 0,
          phtTranslations.targets.empty
        ),
        targetObservation: getTargetObservationSchema().refine(
          (links) => links.length > 0,
          phtTranslations.error.noCalibrationsLinking
        ),
        calibrationStrategy: getCalibrationStrategySchema().refine(
          (strategies) => strategies.length > 0,
          phtTranslations.error.noCalibrationsLoggedOut
        ),
        dataProducts: getDataProductsSchema().refine(
          (dataProducts) => dataProducts.length > 0,
          phtTranslations.page['7'].pageError
        )
      })
      // An SV proposal has no Linking page, so check that data product and target are linked here.
      .refine(
        (values) =>
          values?.proposalType !== PROPOSAL_TYPE.SCIENCE_VERIFICATION ||
          (Array.isArray(values.targetObservation) &&
            Array.isArray(values.dataProducts) &&
            values.targetObservation.some(
              (link) =>
                values.dataProducts.some((dp) => dp?.id === link?.dataProductsSDPId) &&
                link?.sensitivity?.state !== SENSITIVITY_STATE.FAILED
            )),
        {
          message: phtTranslations.page['7'].pageError,
          path: [PAGE_SUBGROUP.dataProducts],
          // Check this rule always, even when a subgroup has issues
          when: () => true
        }
      )
  );
}

/** The status of each of those pages: an error when there is an issue in the page it edits. */
export const getSubmitPageStatuses = (values: ProposalType): Record<SubmitPage, number> => {
  const issues = getProposalSubmitSchema().safeParse(values).error?.issues ?? [];
  const status = (page: SubmitPage) =>
    issues.some((issue) => issue.path[0] === PAGE_SUBGROUP[page]) ? STATUS_ERROR : STATUS_OK;
  return {
    target: status('target'),
    linking: status('linking'),
    calibration: status('calibration'),
    dataProducts: status('dataProducts')
  };
};
