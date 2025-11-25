import { TELESCOPE_LOW, TELESCOPE_MID } from '@ska-telescope/ska-gui-components';
import { Telescope } from '@ska-telescope/ska-gui-local-storage';
import Observation from '../../../utils/types/observation';
import Target from '../../../utils/types/target';
import { SensCalcResults } from '../../../utils/types/sensCalcResults';
import {
  STATUS_PARTIAL,
  USE_LOCAL_DATA_SENSITIVITY_CALC,
  STATUS_ERROR,
  TYPE_CONTINUUM,
  OB_SUBARRAY_CUSTOM,
  TELESCOPE_LOW_NUM,
  TYPE_ZOOM
} from '../../../utils/constants';
import GetZoomData from '../getZoomData/getZoomData';
import GetContinuumData from '../getContinuumData/getContinuumData';
import { SENSCALC_CONTINUUM_MOCKED } from './SensCalcResultsMOCK';

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

    // TODO: revisit error handling - maybe moving to mapping?
    // if ('error' in output) {
    //   return makeResponse(target, STATUS_ERROR, output.error.detail.split('\n')[0]);
    // }
    // if (output['calculate']['error'] && output['calculate']['error']['detail']) {
    //   return makeResponse(target, STATUS_ERROR, output['calculate']['error']['detail']);
    // }
    // if (!isCustom() && output['weighting']['error'] && output['weighting']['error']['detail']) {
    //   return makeResponse(target, STATUS_ERROR, output['weighting']['error']['detail']);
    // }

    // already done is new mapping
    //const results = calculateSensitivityCalculatorResults(output, observation, target);
    // return results

    return output;
  } catch (e) {
    const results = Object.assign(
      {},
      makeResponse(target, STATUS_PARTIAL, ''),
      makeResponse(target, STATUS_ERROR, e)
    );
    return results as SensCalcResults;
  }
}

const getTelescope = (telNum: number): Telescope =>
  telNum === TELESCOPE_LOW_NUM ? TELESCOPE_LOW : TELESCOPE_MID;

async function getSensitivityCalculatorAPIData(
  observation: Observation,
  target: Target,
  _isCustom: boolean
) {
  const telescope: Telescope = getTelescope(observation.telescope);

  const setMockObservation = (obs: Observation) => {
    const data = obs;
    data.type = TYPE_CONTINUUM;
    return data;
  };

  return observation.type === TYPE_CONTINUUM
    ? GetContinuumData(telescope, observation, target)
    : observation.type === TYPE_ZOOM
    ? GetZoomData(telescope, observation, target)
    : GetContinuumData(telescope, setMockObservation(observation), target); // TODO : Change to appropriate function when PST available
}

export default getSensCalc;
