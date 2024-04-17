import sensCalHelpers from './sensCalHelpers';
// import SensitivityCalculatorResults from './../../../utils/types/sensitivityCalculatorResults';
import {
  SensitivityCalculatorAPIResponseLow,
  SensitivityCalculatorAPIResponseMid
} from './../../../utils/types/sensitivityCalculatorAPIResponse';
import Observation from 'utils/types/observation';
import { SensCalcResult } from './getSensitivityCalculatorAPIData';
import { STATUS_OK } from '../../../utils/constants';

let confusionNoise: number;
let weightedSensitivity: number;
let totalSensitivity: number;
let totalSensitivityDisplayValue: any;
let integrationTimeDisplayValue: string;

export default function calculateSensitivityCalculatorResults(
  // response: SensitivityCalculatorAPIResponseLow | SensitivityCalculatorAPIResponseMid,
  response: any,
  observation: Observation
): SensCalcResult /*: SensitivityCalculatorResults*/ {
  //  TODO: change type to SensCalcResult like in getSensitivityCalculatorAPIData and remove SensitivityCalculatorResults type
  confusionNoise = getConfusionNoise(response);
  weightedSensitivity = getWeightedSensitivity(response);
  totalSensitivity = getSensitivity(confusionNoise, weightedSensitivity);
  totalSensitivityDisplayValue = sensCalHelpers.format.convertSensitivityToDisplayValue(
    totalSensitivity
  );
  integrationTimeDisplayValue = `${observation.integration_time} 
  ${sensCalHelpers.format.getIntegrationTimeUnitsLabel(observation.integration_time_units)}`;
  return {
    title: 'TITLE FIELD',
    status: STATUS_OK,
    section1: [
      { field: 'continuumSensitivityWeighted', value: '84.47', units: 'ujy/beam (6.10)' },
      { field: 'continuumConfusionNoise', value: '3.63', units: 'mjy/beam' },
      {
        field: 'continuumTotalSensitivity',
        value: totalSensitivityDisplayValue?.value,
        units: totalSensitivityDisplayValue?.units
      },
      { field: 'continuumSynthBeamSize', value: '190.0" x 171.3"', units: '' },
      { field: 'continuumSurfaceBrightnessSensitivity', value: '3.40', units: 'k' }
    ],
    section2: [
      { field: 'spectralSensitivityWeighted', value: '(2.62)', units: '' },
      { field: 'spectralConfusionNoise', value: '6.02', units: 'mjy/beam' },
      { field: 'spectralTotalSensitivity', value: '9.45', units: 'mjy/beam' },
      { field: 'spectralSynthBeamSize', value: '230.0" x 207.8"', units: '' },
      { field: 'spectralSurfaceBrightnessSensitivity', value: '6.04', units: 'k' }
    ],
    section3: [
      {
        field: 'continuumIntegrationTime',
        value: observation.integration_time,
        units: sensCalHelpers.format.getIntegrationTimeUnitsLabel(
          observation.integration_time_units
        )
      },
      { field: 'spectralIntegrationTime', value: '36.0', units: 'rad/m squared' }
    ]
  } as SensCalcResult;
  /*
  return {
    totalSensitivity: { value: totalSensitivityDisplayValue },
    integrationTime: { value: integrationTimeDisplayValue }
  };
  */
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
