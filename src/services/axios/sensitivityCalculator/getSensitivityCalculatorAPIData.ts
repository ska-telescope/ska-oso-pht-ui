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
  OB_SUBARRAY_CUSTOM,
  TEL
} from '../../../utils/constants';
import calculateSensitivityCalculatorResults from './calculateSensitivityCalculatorResults';
import { SENSCALC_CONTINUUM_MOCKED } from '../../axios/sensitivityCalculator/SensCalcResultsMOCK';
import getZoomData from '../../api/getZoomData/getZoomData';
import getContinuumData from '../../api/getContinuumData/getContinuumData';

const makeResponse = (target: Target, statusGUI: number, error: string) => {
  return {
    id: target.id,
    title: target.name,
    statusGUI,
    error
  };
};

async function getSensCalc(observation: Observation, target: Target): Promise<SensCalcResults> {
  const isCustom = () => observation.subarray === OB_SUBARRAY_CUSTOM;

  if (USE_LOCAL_DATA_SENSITIVITY_CALC) {
    return Promise.resolve(SENSCALC_CONTINUUM_MOCKED);
  }
  const fetchSensCalc = async (observation: Observation, target: Target) => {
    try {
      return await getSensitivityCalculatorAPIData(observation, target, isCustom());
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
    if (!isCustom() && output['weighting']['error'] && output['weighting']['error']['detail']) {
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

async function getSensitivityCalculatorAPIData(
  observation: Observation,
  target: Target,
  isCustom: boolean
) {
  console.log('::: in getSensitivityCalculatorAPIData :::');

  const telescope: string = TEL[observation.telescope].toLowerCase();
  const subArrayResults: any = undefined;
  const mapping: Function = undefined;
  const standardData: any = {};

  console.log('::: telescope', telescope);
  console.log('::: observation', observation);
  console.log('::: observation type is continuum', observation.type === TYPE_CONTINUUM);

  // CONTINUUM
  if (observation.type === TYPE_CONTINUUM) {
    const response = getContinuumData(telescope, subArrayResults, observation, mapping);
    return response;
    // ZOOM
  } else {
    const response = getZoomData(telescope, subArrayResults, observation, mapping);
    return response;
  }
}

export default getSensCalc;
