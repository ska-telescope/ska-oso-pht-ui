import { STATUS_PARTIAL } from '@/utils/constants';
import { calculateSensCalcData } from '@/utils/sensCalc/sensCalc';
import { DataProductSDPNew } from '@/utils/types/dataProduct';
import Observation from '@/utils/types/observation';
import Proposal from '@/utils/types/proposal';
import Target from '@/utils/types/target';
import TargetObservation from '@/utils/types/targetObservation';
import { SensCalcResults } from '@utils/types/sensCalcResults.tsx';


/**
 * Internal helper: performs the full sensCalc update.
 * Not exported — only used by updateSensCalc.
 */
const updateSensCalcAsync = async (
  proposal: Proposal,
  ob: Observation,
  dp: DataProductSDPNew
): Promise<TargetObservation[]> => {
  if (!proposal.targetObservation) return [];

  return await Promise.all(
    proposal.targetObservation.map(async (rec: TargetObservation) => {
      if (rec?.observationId === ob?.id) {
        const target: Target | undefined = proposal.targets?.find(t => t.id === rec.targetId);
        if (!target || !dp) {
          return rec;
        }

        const sensCalcResponse = await calculateSensCalcData(ob, target, dp);
        return {
          ...rec,
          sensCalc: !sensCalcResponse.error ? sensCalcResponse as SensCalcResults : {
            id: rec.targetId,
            title: '',
            statusGUI: -1,
            error: sensCalcResponse.error
          }
        };
      }

      return rec;
    })
  );
};

export const updateSensCalc = async (
  proposal: Proposal,
  ob: Observation,
  dp: DataProductSDPNew
): Promise<TargetObservation[]> => {
  const updated = await updateSensCalcAsync(proposal, ob, dp);

  return updated.map(rec => {
    if (rec?.observationId === ob?.id) {
      return {
        ...rec,
        sensCalc: {
          ...rec.sensCalc,
          statusGUI: STATUS_PARTIAL,
          error: rec.sensCalc?.error ?? ''
        }
      };
    }
    return rec;
  });
};

export default updateSensCalc;
