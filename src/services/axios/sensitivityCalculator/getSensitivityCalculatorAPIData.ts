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
  STATUS_ERROR,
  TYPE_CONTINUUM
} from '../../../utils/constants';
import calculateSensitivityCalculatorResults from './calculateSensitivityCalculatorResults';
import { SENSCALC_CONTINUUM_MOCKED } from '../../axios/sensitivityCalculator/SensCalcResultsMOCK';

const makeResponse = (target: Target, statusGUI: number, error: string) => {
  return {
    id: target.id,
    title: target.name,
    statusGUI,
    error
  };
};

async function getSensCalc(observation: Observation, target: Target): Promise<SensCalcResults> {
  if (USE_LOCAL_DATA_SENSITIVITY_CALC) {
    return Promise.resolve(SENSCALC_CONTINUUM_MOCKED);
  }
  const fetchSensCalc = async (observation: Observation, target: Target) => {
    try {
      return await getSensitivityCalculatorAPIData(observation, target);
    } catch (e) {
      return { error: e };
    }
  };

  try {
    const output = await fetchSensCalc(observation, target);
    if ('error' in output) {
      return makeResponse(target, STATUS_ERROR, output.error.detail.split('\n')[0]);
    }
    // TODO : Not sure we still need these.
    //if (output['calculate']['error']['details']) {
    //  return makeResponse(target, STATUS_ERROR, output['calculate']['error']['details'] );
    //}
    //if (output['weighting']['error']['details']) {
    //  return makeResponse(target, STATUS_ERROR, output['weighting']['error']['details']);
    //}
    const results = calculateSensitivityCalculatorResults(output, observation, target);
    return results;
  } catch (e) {
    const results = Object.assign(
      {},
      makeResponse(target, STATUS_PARTIAL, ''),
      makeResponse(target, STATUS_ERROR, e)
    );
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

  if (observation.type === TYPE_CONTINUUM) {
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
