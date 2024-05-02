import GetCalculate from './getCalculate/getCalculate';
import GetWeighting from './getWeighting/getWeighting';
import { helpers } from '../../../utils/helpers';
import Observation from '../../../utils/types/observation';
import Target from '../../../utils/types/target';
import {
  TYPE_ZOOM,
  STATUS_PARTIAL,
  USE_LOCAL_DATA_SENSITIVITY_CALC,
  STATUS_ERROR,
  TYPE_CONTINUUM
} from '../../../utils/constants';
import calculateSensitivityCalculatorResults from './calculateSensitivityCalculatorResults';
import { SENSCALC_CONTINUUM_MOCKED } from '../../axios/sensitivityCalculator/SensCalcResultsMOCK';

export type SensCalcResult = {
  id?: string;
  title?: string;
  status: number;
  error?: string;
  section1?: { field: string; value: string; units: string }[];
  section2?: { field: string; value: string; units: string }[];
  section3?: { field: string; value: string; units: string }[];
};

const SENSCALC_ERROR: SensCalcResult = {
  title: '',
  status: STATUS_ERROR,
  error: '',
  section1: [],
  section2: [],
  section3: []
};

const SENSCALC_LOADING: SensCalcResult = {
  status: STATUS_PARTIAL
};

function getSensCalc(observation: Observation, target: Target): Promise<SensCalcResult> {
  if (USE_LOCAL_DATA_SENSITIVITY_CALC) {
    return Promise.resolve(SENSCALC_CONTINUUM_MOCKED);
  }

  const fetchSensCalc = async (observation: Observation, target: Target) => {
    try {
      const response = await getSensitivityCalculatorAPIData(observation, target);
      return response;
    } catch (e) {
      return { error: e };
    }
  };

  return fetchSensCalc(observation, target)
    .then(output => {
      if ('error' in output) {
        let err = SENSCALC_ERROR;
        err.title = target.name;
        err.error = output.error;
        return err;
      }
      /* TODO : THIS DOESN'T APPEAR TO BE CORRECT
      if (output?.calculate?.error) {
          let err = SENSCALC_ERROR;
          err.title = target.name;
          err.error = output.calculate.error.detail.split('\n')[0];
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
      */
      return calculateSensitivityCalculatorResults(output, observation, target);
    })
    .catch(e => {
      const results = Object.assign({}, SENSCALC_LOADING, { status: STATUS_ERROR });
      return results as SensCalcResult;
    });
}

async function getSensitivityCalculatorAPIData(observation: Observation, target: Target) {
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
