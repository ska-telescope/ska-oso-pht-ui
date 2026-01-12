import { TELESCOPE_LOW, TELESCOPE_MID } from '@ska-telescope/ska-gui-components';
import { Telescope } from '@ska-telescope/ska-gui-local-storage';
import Observation from '../../../utils/types/observation';
import Target from '../../../utils/types/target';
import { SensCalcResults } from '../../../utils/types/sensCalcResults';
import {
  USE_LOCAL_DATA_SENSITIVITY_CALC,
  TYPE_CONTINUUM,
  SA_CUSTOM,
  TELESCOPE_LOW_NUM,
  TYPE_ZOOM
} from '../../../utils/constants';
import GetZoomData from '../getZoomData/getZoomData';
import GetContinuumData from '../getContinuumData/getContinuumData';
import { SENSCALC_CONTINUUM_MOCKED } from './SensCalcResultsMock';
import { DataProductSDP } from '@/utils/types/dataProduct';

type SensCalcAPIError = { error: string };

export const setMockObservation = (obs: Observation, obsType: number = TYPE_CONTINUUM) => {
  return { ...obs, type: obsType }; // important: don't use "obst.type = TYPE_CONTINUUM" instead as this mutates the original object
};

async function getSensCalc(
  observation: Observation,
  target: Target,
  dataProductSDP: DataProductSDP
): Promise<SensCalcResults | SensCalcAPIError> {
  const isCustom = () => observation.subarray === SA_CUSTOM;

  if (USE_LOCAL_DATA_SENSITIVITY_CALC) {
    return Promise.resolve(SENSCALC_CONTINUUM_MOCKED);
  }
  const fetchSensCalc = async (
    observation: Observation,
    target: Target,
    dataProductSDP: DataProductSDP
  ) => {
    return await getSensitivityCalculatorAPIData(observation, target, dataProductSDP, isCustom());
  };

  try {
    const output: any = await fetchSensCalc(observation, target, dataProductSDP);

    if (!output) {
      throw new Error('error.API_UNKNOWN_ERROR');
    }
    if (output.error && output.results) {
      throw new Error(`${output.results}`);
    }
    return output;
  } catch (e) {
    return e ? { error: String(e) } : { error: 'error.API_UNKNOWN_ERROR' };
  }
}

const getTelescope = (telNum: number): Telescope =>
  telNum === TELESCOPE_LOW_NUM ? TELESCOPE_LOW : TELESCOPE_MID;

async function getSensitivityCalculatorAPIData(
  observation: Observation,
  target: Target,
  dataProductSDP: DataProductSDP,
  _isCustom: boolean
) {
  const telescope: Telescope = getTelescope(observation.telescope);

  return observation.type === TYPE_CONTINUUM
    ? GetContinuumData(telescope, observation, target, dataProductSDP)
    : observation.type === TYPE_ZOOM
    ? GetZoomData(telescope, observation, target, dataProductSDP)
    : GetContinuumData(telescope, setMockObservation(observation), target, dataProductSDP); // TODO : Change to appropriate function when PST available
}

export default getSensCalc;
