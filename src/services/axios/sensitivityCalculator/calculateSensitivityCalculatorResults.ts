import sensCalHelpers from './sensCalHelpers';
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

export default function calculateSensitivityCalculatorResults(
  // response: SensitivityCalculatorAPIResponseLow | SensitivityCalculatorAPIResponseMid,
  response: any,
  observation: Observation
): SensCalcResult {
  confusionNoise = getConfusionNoise(response);
  weightedSensitivity = getWeightedSensitivity(response);
  totalSensitivity = getSensitivity(confusionNoise, weightedSensitivity);
  totalSensitivityDisplayValue = sensCalHelpers.format.convertSensitivityToDisplayValue(
    totalSensitivity
  );
  console.log('TYPE', observation.type); // 0: Zoom / 1: Continuum
  const types = ['spectral', 'continuum'];
  const observationTypeLabel: string = types[observation.type];
  return {
    //
    // TODO : Current values are the same as the MOCKED results, but the value and units fields need to be mapped as required
    //
    // The field values are all correct and have a corresponding translation.
    // I am not sure if we also need translations for the units, but they will be simple to do if required
    //
    title: 'TITLE FIELD',
    status: STATUS_OK,
    // if continuum (use getCalculate and getWeighting) // name without saying continuum or spectral?
    // or change fieldName depending of continnum or zoom?
    section1: [
      {
        field: `${observationTypeLabel}SensitivityWeighted`,
        value: '84.47',
        units: 'ujy/beam (6.10)'
      },
      { field: `${observationTypeLabel}ConfusionNoise`, value: '3.63', units: 'mjy/beam' },
      {
        field: `${observationTypeLabel}TotalSensitivity`,
        value: totalSensitivityDisplayValue?.value,
        units: totalSensitivityDisplayValue?.units
      },
      { field: `${observationTypeLabel}SynthBeamSize`, value: '190.0" x 171.3"', units: '' },
      { field: `${observationTypeLabel}SurfaceBrightnessSensitivity`, value: '3.40', units: 'k' }
    ],
    // if continuum (use getCalculate and getWeightingLine)
    section2: [
      { field: 'continuumSpectralLineSensitivityWeighted', value: '(2.62)', units: '' },
      { field: 'continuumSpectralLineConfusionNoise', value: '6.02', units: 'mjy/beam' },
      { field: 'continuumSpectralLineTotalSensitivity', value: '9.45', units: 'mjy/beam' },
      { field: 'continuumSpectralLineSynthBeamSize', value: '230.0" x 207.8"', units: '' },
      { field: 'continuumSpectralLineSurfaceBrightnessSensitivity', value: '6.04', units: 'k' }
    ],
    // if zoom (use getCalculate and getWeighting) // same as section 1
    section3: [
      { field: 'spectralSensitivityWeighted', value: '(2.62)', units: '' },
      { field: 'spectralConfusionNoise', value: '6.02', units: 'mjy/beam' },
      { field: 'spectralTotalSensitivity', value: '9.45', units: 'mjy/beam' },
      { field: 'spectralSynthBeamSize', value: '230.0" x 207.8"', units: '' },
      { field: 'spectralSurfaceBrightnessSensitivity', value: '6.04', units: 'k' }
    ],
    section4: [
      {
        field: 'integrationTime',
        value: observation.integration_time,
        units: sensCalHelpers.format.getIntegrationTimeUnitsLabel(
          observation.integration_time_units
        )
      }
    ]
  } as SensCalcResult;
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
