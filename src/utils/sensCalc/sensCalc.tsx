import { DataProductSDP } from '../types/dataProduct';
import Observation from '../types/observation';
import { SensCalcResults } from '../types/sensCalcResults';
import Target from '../types/target';
import getSensCalc from '@/services/api/sensitivityCalculator/getSensitivityCalculatorAPIData';

export const calculateSensCalcData = async (
  observation: Observation,
  target: Target,
  dataProductSDP: DataProductSDP
): Promise<SensCalcResults | { error: string }> => {
  return await getSensCalc(observation, target, dataProductSDP);
};
