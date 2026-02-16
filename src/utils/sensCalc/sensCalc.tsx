import getSensCalc from '@/services/axios/get/getSensitivityCalculator/sensitivityCalculator/getSensitivityCalculatorAPIData';
import { DataProductSDPNew } from '../types/dataProduct';
import Observation from '../types/observation';
import { SensCalcResults } from '../types/sensCalcResults';
import Target from '../types/target';

export const calculateSensCalcData = async (
  observation: Observation,
  target: Target,
  dataProductSDP: DataProductSDPNew
): Promise<SensCalcResults | { error: string }> => {
  return await getSensCalc(observation, target, dataProductSDP);
};
