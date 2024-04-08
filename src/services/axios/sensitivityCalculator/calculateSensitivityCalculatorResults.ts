import sensCalHelpers from './sensCalHelpers';
import SensitivityCalculatorResults from './../../../utils/types/sensitivityCalculatorResults';
import {
  SensitivityCalculatorAPIResponseLow,
  SensitivityCalculatorAPIResponseMid
} from './../../../utils/types/sensitivityCalculatorAPIResponse';
import { TEL } from '../../../utils/constants';
import Observation from 'utils/types/observation';

let confusionNoise: number;
let weightedSensitivity: number;
let totalSensitivity: number;
let totalSensitivityDisplayValue: string;
let integrationTimeDisplayValue: string;

export default function calculateSensitivityCalculatorResults(
  response: SensitivityCalculatorAPIResponseLow | SensitivityCalculatorAPIResponseMid,
  observation: Observation
): SensitivityCalculatorResults {
  telescope = TEL[observation.telescope];
  // TODO check why everything is called twice
  confusionNoise = getConfusionNoise(response);
  weightedSensitivity = getWeightedSensitivity(response);
  totalSensitivity = getSensitivity(confusionNoise, weightedSensitivity);
  totalSensitivityDisplayValue = sensCalHelpers.format.convertSensitivityToDisplayValue(
    totalSensitivity
  );
  integrationTimeDisplayValue = `${observation.integration_time} 
  ${sensCalHelpers.format.getIntegrationTimeUnitsLabel(observation.integration_time_units)}`;
  return {
    totalSensitivity: { value: totalSensitivityDisplayValue },
    integrationTime: { value: integrationTimeDisplayValue }
  };
}

function getConfusionNoise(
  response: SensitivityCalculatorAPIResponseLow | SensitivityCalculatorAPIResponseMid
): number {
  // Response is of type SensitivityCalculatorAPIResponseMid
  if ('data' in response.weighting) {
    return response.weighting.data.confusion_noise.value[0];
    // Response is of type SensitivityCalculatorAPIResponseLow
  } else {
    return response.weighting.confusion_noise.value[0];
  }
}

function getWeightedSensitivity(
  response: SensitivityCalculatorAPIResponseLow | SensitivityCalculatorAPIResponseMid
): number {
  // Response is of type SensitivityCalculatorAPIResponseMid
  if ('data' in response.calculate && 'data' in response.weighting) {
    return (
      (response.calculate?.data?.result?.sensitivity ?? 0) *
      response.weighting?.data?.weighting_factor
    );
    // Response is of type SensitivityCalculatorAPIResponseLow
  } else if ('sensitivity' in response.calculate && 'weighting_factor' in response.weighting) {
    return (response.calculate.sensitivity ?? 0) * response.weighting.weighting_factor;
  } else {
    throw new Error('Response object is missing required properties');
  }
}

function getSensitivity(confusionNoise: number, weightedSensitivity: number): number {
  return sensCalHelpers.calculate.sqrtOfSumSqs(confusionNoise * 1e6, weightedSensitivity);
}
