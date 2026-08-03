import { TELESCOPE_LOW, TELESCOPE_MID } from '@ska-telescope/ska-gui-components';
import { Telescope } from '@ska-telescope/ska-gui-local-storage';
import Observation from '../../../../../utils/types/observation';
import Target from '../../../../../utils/types/target';
import { SensCalcResults } from '../../../../../utils/types/sensCalcResults';
import {
  USE_LOCAL_DATA_SENSITIVITY_CALC,
  TYPE_CONTINUUM,
  TYPE_CONTINUUM_SPECTRAL,
  SA_CUSTOM,
  TELESCOPE_LOW_NUM,
  TYPE_ZOOM
} from '../../../../../utils/constants';
import GetZoomData from '../getZoomData/getZoomData';
import GetContinuumData from '../getContinuumData/getContinuumData';
import { SENSCALC_CONTINUUM_MOCKED } from './SensCalcResultsMock';
import { DataProductSDPNew, SDPSpectralData } from '@/utils/types/dataProduct';

type SensCalcAPIError = { error: string };

export const setMockObservation = (obs: Observation, observationType: string = TYPE_CONTINUUM) => {
  return { ...obs, type: observationType }; // important: don't use "obs.type = TYPE_CONTINUUM" instead as this mutates the original object
};

async function getSensCalc(
  observation: Observation,
  target: Target,
  dataProductSDP: DataProductSDPNew
): Promise<SensCalcResults | SensCalcAPIError> {
  const isCustom = () => observation.subarray === SA_CUSTOM;

  if (USE_LOCAL_DATA_SENSITIVITY_CALC) {
    return Promise.resolve(SENSCALC_CONTINUUM_MOCKED);
  }

  try {
    const output: any = await getSensitivityCalculatorAPIData(
      observation,
      target,
      dataProductSDP,
      isCustom()
    );

    if (!output) {
      return { error: 'error.API_UNKNOWN_ERROR' };
    }
    if (output.error && output.results) {
      return { error: `${output.error}: ${output.results}` };
    }
    return output;
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
}

const getTelescope = (telNum: number): Telescope =>
  telNum === TELESCOPE_LOW_NUM ? TELESCOPE_LOW : TELESCOPE_MID;

/**
 * Routes a sensitivity-calculator request to the continuum or spectral (zoom) endpoint based on
 * the observation's type.
 */
async function getSensitivityCalculatorAPIData(
  observation: Observation,
  target: Target,
  dataProductSDP: DataProductSDPNew,
  _isCustom: boolean
) {
  const telescope: Telescope = getTelescope(observation.telescope);

  if (observation.type === TYPE_CONTINUUM) {
    return GetContinuumData(telescope, observation, target, dataProductSDP);
  }
  if (observation.type === TYPE_ZOOM) {
    return GetZoomData(telescope, observation, target, dataProductSDP);
  }
  if (observation.type === TYPE_CONTINUUM_SPECTRAL) {
    // Combined mode: same request as a plain continuum observation, except the bandwidth is the
    // continuum bandwidth divided by the channel count set on the Data Products page, rather than
    // the full continuum bandwidth.
    //
    // Note: the name continuumBandwidth is misleading here as it actually represents the bandwidth
    // of a single channel in this case (allows reuse of the GetContinuumData function).
    const channelsOut = (dataProductSDP?.data as SDPSpectralData)?.channelsOut || 1;
    const combinedObservation: Observation = {
      ...setMockObservation(observation),
      continuumBandwidth: (observation.continuumBandwidth ?? 0) / channelsOut
    };
    return GetContinuumData(telescope, combinedObservation, target, dataProductSDP);
  }
  return GetContinuumData(telescope, setMockObservation(observation), target, dataProductSDP);
}

export default getSensCalc;
