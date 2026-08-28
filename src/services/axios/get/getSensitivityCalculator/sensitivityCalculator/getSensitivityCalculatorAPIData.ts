import { Telescope } from '@ska-telescope/ska-gui-local-storage';
import Observation from '../../../../../utils/types/observation';
import Target from '../../../../../utils/types/target';
import { SensCalcResults } from '../../../../../utils/types/sensCalcResults';
import {
  REFERENCE_COORDINATE_TYPE_SSO,
  STATUS_ERROR,
  TELESCOPE_LOW_NUM,
  TYPE_CONTINUUM,
  TYPE_CONTINUUM_SPECTRAL,
  TYPE_CONTINUUM_SPECTRAL_LONG,
  TYPE_PST,
  TYPE_ZOOM,
  TYPE_ZOOM_LONG
} from '../../../../../utils/constants';
import GetZoomData from '../getZoomData/getZoomData';
import GetContinuumData from '../getContinuumData/getContinuumData';
import { DataProductSDPNew, SDPSpectralData } from '@/utils/types/dataProduct';
import { getTelescope } from '@utils/helpers.ts';

async function getSensCalc(
  observation: Observation,
  target: Target,
  dataProductSDP: DataProductSDPNew
): Promise<SensCalcResults | undefined> {
  // First check if the inputs are for a known unsupported mode, and if so return undefined
  if (target.kind === REFERENCE_COORDINATE_TYPE_SSO.value) {
    return undefined;
  }
  if (observation.type == TYPE_PST) {
    return undefined;
  }

  const telescope: Telescope = getTelescope(observation.telescope);

  switch (observation.type) {
    case TYPE_CONTINUUM:
      return GetContinuumData(telescope, observation, target, dataProductSDP);
    case TYPE_ZOOM:
    case TYPE_ZOOM_LONG:
      return GetZoomData(telescope, observation, target, dataProductSDP);
    case TYPE_CONTINUUM_SPECTRAL_LONG:
    case TYPE_CONTINUUM_SPECTRAL: {
      const combinedObservation: Observation = {
        ...observation,
        type: TYPE_CONTINUUM
      };
      return GetContinuumData(telescope, combinedObservation, target, dataProductSDP);
    }
    default:
      return {
        statusGUI: STATUS_ERROR,
        error: `Observation type ${observation.type} not supported for the Sensitivity Calculator.`
      };
  }
}

export default getSensCalc;
