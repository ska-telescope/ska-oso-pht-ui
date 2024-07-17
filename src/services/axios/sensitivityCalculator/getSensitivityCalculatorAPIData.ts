import GetCalculate from './getCalculate/getCalculate';
import GetWeighting from './getWeighting/getWeighting';
import { helpers } from '../../../utils/helpers';
import Observation from '../../../utils/types/observation';
import Target from '../../../utils/types/target';
import { SensCalcResults } from '../../../utils/types/sensCalcResults';
import {
  TYPE_ZOOM,
  STATUS_PARTIAL,
  USE_LOCAL_DATA_SENSITIVITY_CALC,
  STATUS_ERROR
} from '../../../utils/constants';
import calculateSensitivityCalculatorResults from './calculateSensitivityCalculatorResults';
import { SENSCALC_CONTINUUM_MOCKED } from '../../axios/sensitivityCalculator/SensCalcResultsMOCK';

const SENSCALC_ERROR: SensCalcResults = {
  title: '',
  status: STATUS_ERROR,
  error: '',
  section1: [],
  section2: [],
  section3: []
};

export const SENSCALC_LOADING: SensCalcResults = {
  status: STATUS_PARTIAL
};

async function getSensCalc(observation: Observation, target: Target): Promise<SensCalcResults> {
  if (USE_LOCAL_DATA_SENSITIVITY_CALC) {
    return Promise.resolve(SENSCALC_CONTINUUM_MOCKED);
  }
  const fetchSensCalc = async (observation: Observation, target: Target) => {
    try {
      const result = await getSensitivityCalculatorAPIData(observation, target);
      return result;
    } catch (e) {
      return { error: e };
    }
  };

  try {
    const output = await fetchSensCalc(observation, target);

    if ('error' in output) {
      let err = SENSCALC_ERROR;
      err.title = target.name;
      err.error = output.error;
      return err;
    }

    if ('calculate' in output) {
      if ('error' in output.weighting) {
        let err = SENSCALC_ERROR;
        err.title = target.name;
        err.error = output.weighting.error.detail.split('\n')[0];
        return err;
      }
    }

    if ('weighting' in output) {
      if ('error' in output.weighting) {
        let err = SENSCALC_ERROR;
        err.title = target.name;
        err.error = output.weighting.error.detail.split('\n')[0];
        return err;
      }
    }

    const results = await calculateSensitivityCalculatorResults(output, observation, target);
    return results;
  } catch (e) {
    const results = Object.assign({}, SENSCALC_LOADING, {
      id: target.id,
      title: target.name,
      status: STATUS_ERROR
    });
    return results as SensCalcResults;
  }
}

async function getSensitivityCalculatorAPIData(observation: Observation, target: Target) {
  /* 
    When the users clicks on the Calculate button of the Sensitivity Calculator,
    there are 2 or 3 calls to the API made

    Mid Continuum Modes: 
    - 1 call to getCalculate
    - 1 call to GetWeighting - with Continuum parameter
    - 1 call to GetWeighting - with Zoom parameter (weightingLine)

    Mid Zoom Modes: 
    - 1 call to getCalculate - with Zoom parameter
    - 1 call to GetWeighting - with Zoom parameter (weightingLine)

    Low (Continuum and Zoom Modes): 
    - 1 call to getCalculate
    - 1 call to GetWeighting
  */

  const promises = [
    GetCalculate(observation, target),
    GetWeighting(observation, target, observation.type)
  ];

  if (observation.type !== TYPE_ZOOM) {
    promises.push(GetWeighting(observation, target, TYPE_ZOOM));
  }

  const [calculate, weighting, weightingLine] = await Promise.all(promises);

  const response = {
    calculate,
    weighting,
    weightingLine
  };

  helpers.transform.trimObject(response);
  return response;
}

export default getSensCalc;
