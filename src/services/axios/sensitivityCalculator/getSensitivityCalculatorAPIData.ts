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
  TYPE_CONTINUUM,
  SUPPLIED_TYPE_SENSITIVITY,
  OB_SUBARRAY_CUSTOM
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
    const output: any = await fetchSensCalc(observation, target);
    if ('error' in output) {
      return makeResponse(target, STATUS_ERROR, output.error.detail.split('\n')[0]);
    }
    if (output['calculate']['error'] && output['calculate']['error']['detail']) {
      return makeResponse(target, STATUS_ERROR, output['calculate']['error']['detail']);
    }
    if (output['weighting']['error'] && output['weighting']['error']['detail']) {
      return makeResponse(target, STATUS_ERROR, output['weighting']['error']['detail']);
    }
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
    there are 1, 2, 3, or 4 calls to the API made

    Mid Continuum Modes: 
    - 1 call to getCalculate - supplied integration time or for supplied sensitivity: with Continuum thermal sensitivity
    - 1 call to getCalculate - for supplied sensitivity: with Spectral thermal sensitivity
    - 1 call to GetWeighting - with Continuum parameter
    - 1 call to GetWeighting - with Spectral parameter (weightingLine)

    Mid Zoom Modes: 
    - 1 call to getCalculate - with Zoom parameter and with supplied integration time or for supplied sensitivity: with Spectral thermal sensitivity
    - 1 call to GetWeighting - with Zoom parameter (weightingLine)

    Low Continuum Modes: 
    - 1 call to getCalculate
    - 1 call to GetWeighting - with Continuum parameter
    - 1 call to GetWeighting - with Spectral parameter (weightingLine)

    Low Zoom Modes: 
    - 1 call to getCalculate
    - 1 call to GetWeighting -  with Zoom parameter

    CUSTOM Array: (For Custom array, no calls to weighting endpoint are made)
    - 0 call to getWeighting
    - 1 call to to getCalculate
  */

  const isCustom = () => observation.subarray === OB_SUBARRAY_CUSTOM;

  function handleWeighting() {
    console.log('isCustom', isCustom());
    if (isCustom()) {
      return [];
    }
    const promisesWeighting = [GetWeighting(observation, target, observation.type)];
    if (observation.type === TYPE_CONTINUUM) {
      promisesWeighting.push(GetWeighting(observation, target, TYPE_ZOOM, true));
    }
    return promisesWeighting;
  }

  function handleCalculate(weightingResponse) {
    const promisesCalculate = [
      GetCalculate(observation, target, weightingResponse.weighting, observation.type)
    ];
    if (
      observation.type === TYPE_CONTINUUM &&
      observation.supplied.type === SUPPLIED_TYPE_SENSITIVITY
    ) {
      promisesCalculate.push(
        GetCalculate(observation, target, weightingResponse.weightingLine, TYPE_ZOOM)
      );
    }
    return promisesCalculate;
  }

  // weighting responses
  const promisesWeighting = handleWeighting();
  const [weighting, weightingLine] = await Promise.all(promisesWeighting);
  const weightingResponse = {
    weighting,
    weightingLine
  };

  // calculate responses
  const promisesCalculate = handleCalculate(weightingResponse);
  const [calculate, calculateSpectral] = await Promise.all(promisesCalculate);
  const calculateResponse = {
    calculate,
    calculateSpectral
  };

  // TODO harmonise responses format before passing to
  // calculateSensitivityCalculatorResults? (handling[0] for zoom, etc)

  const response = {
    ...weightingResponse,
    ...calculateResponse
  };
  helpers.transform.trimObject(response);
  console.log('response', response);
  return response;
}

export default getSensCalc;
