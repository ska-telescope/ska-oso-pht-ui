import Observation from '../types/observation';
import Target from '../types/target';
import getSensCalc from '@/services/api/sensitivityCalculator/getSensitivityCalculatorAPIData';

export const calculateSensCalcData = async (observation: Observation, target: Target) => {
  return await getSensCalc(observation, target);
};
