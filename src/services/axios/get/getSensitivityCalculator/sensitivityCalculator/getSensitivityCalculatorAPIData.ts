import { TELESCOPE_LOW, TELESCOPE_MID } from '@ska-telescope/ska-gui-components';
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
      // Combined mode: same request as a plain continuum observation, except the bandwidth is the
      // continuum bandwidth divided by the channel count set on the Data Products page, rather than
      // the full continuum bandwidth.
      //
      // Note: the name continuumBandwidth is misleading here as it actually represents the bandwidth
      // of a single channel in this case (allows reuse of the GetContinuumData function).
      const channelsOut = (dataProductSDP?.data as SDPSpectralData)?.channelsOut || 1;
      const combinedObservation: Observation = {
        ...observation,
        type: TYPE_CONTINUUM,
        continuumBandwidth: (observation.continuumBandwidth ?? 0) / channelsOut
      };
      return GetContinuumData(telescope, combinedObservation, target, dataProductSDP);
    }
    default:
      return {
        statusGUI: STATUS_ERROR,
        title: 'Unsupported mode for the Sensitivity Calculator',
        error: `Observation type ${observation.type} not supported.`
      };
  }
}

export default getSensCalc;
