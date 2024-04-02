import { sqrtOfSumSqs, convertSensitivityToDisplayValue } from './helpers';

let confusionNoise;
let weightedSensitivity;
let totalSensitivity;
let totalSensitivityDisplayValue;

export default function calculateSensitivityCalculatorResults(response) {
  // TODO improve typing
  // TODO -> this is for Low Continuum: implement for zoom and Mid Continuum + Zoom and check differences
  // TODO refactor helpers file in sens cal folder
  // TODO check why everything is called twice
  console.log('::: in calculateSensitivityCalculatorResults()', response);
  console.log(response.calculate.sensitivity);
  console.log(response.calculate.units);
  confusionNoise = getConfusionNoise(response);
  weightedSensitivity = getWeightedSensitivity(response);
  totalSensitivity = totalSensitivity = getSensitivity(confusionNoise, weightedSensitivity);
  totalSensitivityDisplayValue = convertSensitivityToDisplayValue(totalSensitivity);
  console.log('totalSensitivity', totalSensitivity);
  console.log('totalSensitivityDisplayValue', totalSensitivityDisplayValue);
  return {
    totalSensitivity: { label: 'Total Sensitivity', value: totalSensitivityDisplayValue }
  };
}

function getConfusionNoise(response) {
  return response.weighting.confusion_noise.value[0];
}

function getWeightedSensitivity(response) {
  return (response.calculate.sensitivity ?? 0) * response.weighting.weighting_factor;
}

function getIntegrationTime() {
  // TODO
}

function getSensitivity(confusionNoise, weightedSensitivity): number {
  // TODO
  // LOW: response.weighting.sensitivity and response.weighting.units
  return sqrtOfSumSqs(confusionNoise * 1e6, weightedSensitivity);
}
