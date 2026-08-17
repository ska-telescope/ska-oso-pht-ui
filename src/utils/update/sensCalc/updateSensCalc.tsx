import { STATUS_INITIAL } from '@/utils/constants';
import { DataProductSDPNew } from '@/utils/types/dataProduct';
import Observation from '@/utils/types/observation';
import Proposal from '@/utils/types/proposal';
import { SensCalcResults } from '@/utils/types/sensCalcResults';
import TargetObservation from '@/utils/types/targetObservation';
import getSensCalc from '@services/axios/get/getSensitivityCalculator/sensitivityCalculator/getSensitivityCalculatorAPIData.ts';
import { isDataProductRobustValid, isSuppliedValueValid } from '@/utils/validation/validation';

export const getTargetObservationKey = (
  targetObservation: Pick<TargetObservation, 'targetId' | 'observationId' | 'dataProductsSDPId'>
) =>
  `${targetObservation.targetId}|${targetObservation.observationId}|${targetObservation.dataProductsSDPId}`;

export type SensCalcPatch = {
  targetObservationKey: string;
  sensCalc: SensCalcResults;
};

export const applySensCalcPatches = (
  targetObservations: TargetObservation[] | undefined,
  patches: SensCalcPatch[]
): TargetObservation[] | undefined => {
  if (!targetObservations?.length || patches.length === 0) {
    return targetObservations;
  }

  const patchesByKey = new Map(
    patches.map((patch) => [patch.targetObservationKey, patch.sensCalc])
  );
  return targetObservations.map((targetObservation) => {
    const patchedSensCalc = patchesByKey.get(getTargetObservationKey(targetObservation));
    if (!patchedSensCalc) {
      return targetObservation;
    }
    return { ...targetObservation, sensCalc: patchedSensCalc };
  });
};

const areSensCalcInputsValid = (ob: Observation, dp: DataProductSDPNew) =>
  isSuppliedValueValid({
    type: ob?.supplied?.type,
    value: ob?.supplied?.value,
    units: ob?.supplied?.units
  }) && isDataProductRobustValid(dp);

/**
 * Recalculates the sensitivity calculator results for any TargetObservation within the Proposal
 * that references either the observation or the data product
 *
 * Returns minimal sensitivity patches keyed by target-observation identity
 */
export const fetchSensCalcPatches = async (
  proposal: Proposal,
  ob: Observation,
  dp: DataProductSDPNew
): Promise<SensCalcPatch[]> => {
  if (!proposal.targetObservation) return [];
  const inputsAreValid = areSensCalcInputsValid(ob, dp);

  const updates = await Promise.all(
    proposal.targetObservation
      .filter(
        (targetObservation) =>
          targetObservation.observationId === ob.id || targetObservation.dataProductsSDPId === dp.id
      )
      .map(async (targetObservation: TargetObservation) => {
        const targetObservationKey = getTargetObservationKey(targetObservation);
        const target = proposal.targets?.find((t) => t.id === targetObservation.targetId);

        if (!inputsAreValid) {
          return {
            targetObservationKey,
            sensCalc: {
              title: '',
              statusGUI: STATUS_INITIAL,
              error: ''
            }
          };
        }

        if (!target) {
          return null;
        }

        const sensCalcResponse = await getSensCalc(ob, target, dp);

        return {
          targetObservationKey,
          sensCalc: sensCalcResponse
        };
      })
  );
  return updates.filter((update): update is SensCalcPatch => update !== null);
};

export default fetchSensCalcPatches;
