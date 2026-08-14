import { STATUS_INITIAL, STATUS_PARTIAL } from '@/utils/constants';
import { DataProductSDPNew } from '@/utils/types/dataProduct';
import Observation from '@/utils/types/observation';
import Proposal from '@/utils/types/proposal';
import TargetObservation from '@/utils/types/targetObservation';
import getSensCalc from '@services/axios/get/getSensitivityCalculator/sensitivityCalculator/getSensitivityCalculatorAPIData.ts';
import { isDataProductRobustValid, isSuppliedValueValid } from '@/utils/validation/validation';

const SENS_CALC_DEBOUNCE_MS = 500;

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
 * Returns the updated TargetObservations
 */
export const updateSensCalc = async (
  proposal: Proposal,
  ob: Observation,
  dp: DataProductSDPNew
): Promise<TargetObservation[]> => {
  if (!proposal.targetObservation) return [];
  const inputsAreValid = areSensCalcInputsValid(ob, dp);

  const updated = await Promise.all(
    proposal.targetObservation
      .filter(
        (targetObservation) =>
          targetObservation.observationId === ob.id || targetObservation.dataProductsSDPId === dp.id
      )
      .map(async (targetObservation: TargetObservation) => {
        const target = proposal.targets?.find((t) => t.id === targetObservation.targetId);
        if (!inputsAreValid) {
          return {
            ...targetObservation,
            sensCalc: {
              title: '',
              statusGUI: STATUS_INITIAL,
              error: ''
            }
          };
        }

        if (!target || !dp) {
          return targetObservation;
        }

        const sensCalcResponse = await getSensCalc(ob, target, dp);

        return {
          ...targetObservation,
          sensCalc: sensCalcResponse
        };
      })
  );

  // TODO figure out why the status is set to STATUS_PARTIAL here
  return updated
    .filter(
      (targetObservation) =>
        targetObservation.observationId === ob.id || targetObservation.dataProductsSDPId === dp.id
    )
    .map((targetObservation) => {
      if (targetObservation.sensCalc === undefined) {
        return targetObservation;
      }
      if (targetObservation.sensCalc.statusGUI === STATUS_INITIAL) {
        return targetObservation;
      }
      return {
        ...targetObservation,
        sensCalc: { ...targetObservation.sensCalc, statusGUI: STATUS_PARTIAL }
      };
    });
};

let sensCalcDebounceTimer: ReturnType<typeof setTimeout> | null = null;
let latestSensCalcRequestId = 0;

export const updateSensCalcDebounced = (
  proposal: Proposal,
  ob: Observation,
  dp: DataProductSDPNew,
  setProposal: (proposal: Proposal) => void
) => {
  if (sensCalcDebounceTimer) {
    clearTimeout(sensCalcDebounceTimer);
  }
  const requestId = ++latestSensCalcRequestId;

  const applyUpdate = async () => {
    sensCalcDebounceTimer = null;
    const targetObservation = await updateSensCalc(proposal, ob, dp);
    if (requestId === latestSensCalcRequestId) {
      setProposal({ ...proposal, targetObservation });
    }
  };

  if (areSensCalcInputsValid(ob, dp)) {
    sensCalcDebounceTimer = setTimeout(() => void applyUpdate(), SENS_CALC_DEBOUNCE_MS);
  } else {
    void applyUpdate();
  }
};

export default updateSensCalc;
