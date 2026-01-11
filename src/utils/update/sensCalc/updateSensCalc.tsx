import { STATUS_PARTIAL } from '@/utils/constants';
import { calculateSensCalcData } from '@/utils/sensCalc/sensCalc';
import { DataProductSDPNew } from '@/utils/types/dataProduct';
import Observation from '@/utils/types/observation';
import Proposal from '@/utils/types/proposal';
import { SensCalcResults } from '@/utils/types/sensCalcResults';
import Target from '@/utils/types/target';
import TargetObservation from '@/utils/types/targetObservation';

const getSensCalcData = async (
  observation: Observation,
  target: Target,
  dataProductSDP: DataProductSDPNew
): Promise<SensCalcResults | null> => {
  try {
    const response = await calculateSensCalcData(observation, target, dataProductSDP);

    if (!response || (response as any).error) {
      return null;
    }

    return response as SensCalcResults;
  } catch {
    return null;
  }
};

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

  const result = await Promise.all(
    proposal.targetObservation.map(async (rec: TargetObservation) => {
      if (rec?.observationId === ob?.id) {
        const target: Target | undefined = proposal.targets?.find(t => t.id === rec.targetId);
        if (!target || !dp) {
          return rec;
        }

        const sensCalc = await getSensCalcData(ob, target, dp);
        return {
          ...rec,
          sensCalc: sensCalc ?? {
            id: rec.targetId,
            title: '',
            statusGUI: -1,
            error: 'SensCalc failed'
          }
        };
      }

      return rec;
    })
  );

  return result;
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
