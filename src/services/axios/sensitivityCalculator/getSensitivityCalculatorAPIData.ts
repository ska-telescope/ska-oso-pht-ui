import GetCalculate from './getCalculate/getCalculate';
import GetWeighting from './getWeighting/getWeighting';
import { helpers } from '../../../utils/helpers';
import Observation from '../../../utils/types/observation';
import Target from '../../../utils/types/target';
import {
  TYPE_ZOOM,
  STATUS_OK,
  STATUS_INITIAL,
  STATUS_PARTIAL,
  USE_LOCAL_DATA,
  STATUS_ERROR,
  TYPE_CONTINUUM
} from '../../../utils/constants';

export type SensCalcResult = {
  status: number;
  section1?: { field: string; value: string; units: string }[];
  section2?: { field: string; value: string; units: string }[];
  section3?: { field: string; value: string; units: string }[];
};

export const SENSCALC_EMPTY: SensCalcResult = {
  status: STATUS_INITIAL
};

export const SENSCALC_MOCKED: SensCalcResult = {
  status: STATUS_OK,
  section1: [
    { field: 'continuumSensitivityWeighted', value: '84.47', units: 'ujy/beam (6.10)' },
    { field: 'continuumConfusionNoise', value: '3.63', units: 'mjy/beam' },
    { field: 'continuumTotalSensitivity', value: '3.64', units: 'mjy/beam' },
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
    { field: 'continuumIntegrationTime', value: '19.3', units: 'rad/m squared' },
    { field: 'spectralIntegrationTime', value: '36.0', units: 'rad/m squared' }
  ]
};

const SENSCALC_LOADING: SensCalcResult = {
  status: STATUS_PARTIAL
};

function mapping(inRec: any) {
  //
  // TODO : Current values are the same as the MOCKED results, but the value and units fields need to be mapped as required
  //
  // The field values are all correct and have a corresponding translation.
  // I am not sure if we also need translations for the units, but they will be simple to do if required
  //
  // console.log("mapping", inRec);
  //
  return {
    status: STATUS_OK,
    section1: [
      { field: 'continuumSensitivityWeighted', value: '84.47', units: 'ujy/beam (6.10)' },
      { field: 'continuumConfusionNoise', value: '3.63', units: 'mjy/beam' },
      { field: 'continuumTotalSensitivity', value: '3.64', units: 'mjy/beam' },
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
      { field: 'continuumIntegrationTime', value: '19.3', units: 'rad/m squared' },
      { field: 'spectralIntegrationTime', value: '36.0', units: 'rad/m squared' }
    ]
  } as SensCalcResult;
}

function getSensCalc(observation: Observation, target: Target): SensCalcResult {
  if (USE_LOCAL_DATA) {
    return SENSCALC_MOCKED;
  }
  let results = SENSCALC_LOADING;
  try {
    const output = fetchSensCalc(observation, target);
    return mapping(output);
  } catch (e) {
    results.status = STATUS_ERROR;
    return results;
  }
}

const fetchSensCalc = async (observation: Observation, target: Target) => {
  return await getSensitivityCalculatorAPIData(observation, target);
};

async function getSensitivityCalculatorAPIData(observation: Observation, target: Target) {
  //
  //  NOTE : It has been discussed that the calculations will need information from both the observation and the target, so both have been provided.
  //

  /* 
    When the users clicks on the Calculate button of the Sensitivity Calculator,
    there are 2 or 3 calls to the API made

    Continuum Modes (Low or Mid): 
    - 1 call to getCalculate - with Continuum parameter
    - 1 call to GetWeighting - with Continuum parameter
    - 1 call to GetWeighting - with Zoom parameter (weightingLine)

    Zoom Modes (Low or Mid): 
    - 1 call to getCalculate - with Zoom parameter
    - 1 call to GetWeighting - with Zoom parameter (weightingLine)
  */

  const calculate = await GetCalculate(observation);
  const weighting = await GetWeighting(observation, observation.type);
  const weightingLine =
    observation.type !== TYPE_ZOOM ? await GetWeighting(observation, TYPE_CONTINUUM) : null;

  const response = {
    calculate,
    weighting,
    weightingLine
  };

  helpers.transform.trimObject(response);

  return response;
}

export default getSensCalc;
