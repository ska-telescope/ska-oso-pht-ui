import getSensCalc from '@/services/axios/get/getSensitivityCalculator/sensitivityCalculator/getSensitivityCalculatorAPIData';
import { DataProductSDPNew } from '../types/dataProduct';
import Observation from '../types/observation';
import { SensCalcResults } from '../types/sensCalcResults';
import Target from '../types/target';
import { REFERENCE_COORDINATE_TYPE_SSO } from '@utils/constants.ts';

export const calculateSensCalcData = async (
  observation: Observation,
  target: Target,
  dataProductSDP: DataProductSDPNew
): Promise<SensCalcResults | { error: string } | undefined> => {

  if (target.kind === REFERENCE_COORDINATE_TYPE_SSO.value) {
    return undefined;
  }

  return await getSensCalc(
    observation,
    target,
    dataProductSDP
  );
};
