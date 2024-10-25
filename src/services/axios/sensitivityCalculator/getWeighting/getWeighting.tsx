import axios from 'axios';
import {
  OBSERVATION,
  USE_LOCAL_DATA_SENSITIVITY_CALC,
  SKA_SENSITIVITY_CALCULATOR_API_URL,
  AXIOS_CONFIG,
  TELESCOPE_LOW_NUM,
  OBSERVATION_TYPE_SENSCALC,
  OBSERVATION_TYPE_BACKEND,
  TYPE_ZOOM,
  IMAGE_WEIGHTING,
  ROBUST,
  IW_BRIGGS,
  TYPE_CONTINUUM
} from '../../../../utils/constants';
import {
  MockResponseMidWeightingContinuum,
  MockResponseMidWeightingLine
} from './mockResponseMidWeighting';
import {
  MockResponseLowWeightingContinuum,
  MockResponseLowWeightingLineZoom,
  MockResponseLowWeightingLineSpectral
} from './mockResponseLowWeighting';
import Observation from '../../../../utils/types/observation';
import { TELESCOPE_LOW, TELESCOPE_MID } from '@ska-telescope/ska-gui-components';
import sensCalHelpers from '../sensCalHelpers';
import Target from '../../../../utils/types/target';
import {
  WeightingLowContinuumQuery,
  WeightingLowSpectralQuery,
  WeightingLowZoomQuery,
  WeightingMidContinuumQuery,
  WeightingMidSpectralQuery,
  WeightingMidZoomQuery,
  WeightingQuery
} from '.././../../../utils/types/sensCalcWeightingQuery';

const URL_WEIGHTING = `weighting`;

async function GetWeighting(
  observation: Observation,
  target: Target,
  inMode: number,
  inIsSpectral = false
) {
  const apiUrl = SKA_SENSITIVITY_CALCULATOR_API_URL;

  const isLow = () => observation.telescope === TELESCOPE_LOW_NUM;
  const isZoom = () => inMode === TYPE_ZOOM;
  const isSpectral = () => inIsSpectral;

  const getTelescope = () => (isLow() ? TELESCOPE_LOW.code : TELESCOPE_MID.code);

  const getMode = () => {
    if (isSpectral()) {
      // spectral uses continuum url but mode is set to zoom
      return OBSERVATION_TYPE_BACKEND[TYPE_CONTINUUM].toLowerCase() + '/';
    }
    return OBSERVATION_TYPE_BACKEND[inMode].toLowerCase() + '/';
  };

  const getWeightingMode = () => {
    return IMAGE_WEIGHTING.find(obj => obj.value === observation.imageWeighting)?.lookup;
  };

  const getRobustness = () => {
    return ROBUST.find(item => item.value === observation.robust)?.label;
  };

  const getSubArray = () => {
    const array = OBSERVATION.array.find(obj => obj.value === observation.telescope);
    const arrConfig = array?.subarray.find(obj => obj.value === observation.subarray);
    return arrConfig?.map;
  };

  // TODO : Need to know if we are getting Equatorial or Galactic  ( units ? )
  function rightAscension() {
    return target.ra
      .replace('+', '')
      .replace('-', '')
      .replace(' ', '');
  }

  function declination() {
    return target.dec
      .replace('+', '')
      .replace('-', '')
      .replace(' ', '');
  }

  /*********************************************************** MID *********************************************************/

  const convertFrequency = (value: number | string, units: number | string) =>
    sensCalHelpers.format.convertBandwidthToHz(value, units);

  const getParamZoomMID = (): WeightingMidZoomQuery => {
    const params = {
      freq_centres_hz: convertFrequency(
        observation.centralFrequency,
        observation.centralFrequencyUnits
      ),
      pointing_centre: rightAscension() + ' ' + declination(), // MANDATORY
      weighting_mode: getWeightingMode(),
      robustness: getRobustness(),
      subarray_configuration: getSubArray(),
      taper: observation.tapering
      // TODO check how taper is handled in the sens calc as seems off
      // their value displayed is different than value sent
    };
    if (observation.imageWeighting === IW_BRIGGS) {
      params['robustness'] = getRobustness();
    }
    return params;
  };

  const getParamSpectralMID = (): WeightingMidSpectralQuery => {
    const params = {
      spectral_mode: OBSERVATION_TYPE_SENSCALC[inMode].toLowerCase(),
      freq_centre_hz: convertFrequency(
        observation.centralFrequency,
        observation.centralFrequencyUnits
      ),
      pointing_centre: rightAscension() + ' ' + declination(), // MANDATORY
      weighting_mode: getWeightingMode(),
      robustness: getRobustness(),
      subarray_configuration: getSubArray(),
      taper: observation.tapering
      // TODO check how taper is handled in the sens calc as seems off
      // their value displayed is different than value sent
    };
    if (observation.imageWeighting === IW_BRIGGS) {
      params['robustness'] = getRobustness();
    }
    return params;
  };

  const getParamContinuumMID = (): WeightingMidContinuumQuery => {
    const params = {
      spectral_mode: OBSERVATION_TYPE_SENSCALC[inMode].toLowerCase(),
      freq_centre_hz: convertFrequency(
        observation.centralFrequency,
        observation.centralFrequencyUnits
      ),
      pointing_centre: rightAscension() + ' ' + declination(),
      weighting_mode: getWeightingMode(),
      robustness: getRobustness(),
      subarray_configuration: getSubArray(),
      taper: observation.tapering
      // TODO check how taper is handled in the sens calc as seems off
      // their value displayed is different than value sent
    };
    if (observation.imageWeighting === IW_BRIGGS) {
      params['robustness'] = getRobustness();
    }
    return params;
  };

  /*********************************************************** LOW *********************************************************/

  function pointingCentre() {
    return rightAscension() + ' ' + declination();
  }

  const getParamZoomLOW = (): WeightingLowZoomQuery => {
    const params = {
      weighting_mode: getWeightingMode(),
      subarray_configuration: getSubArray(),
      pointing_centre: pointingCentre(),
      freq_centres_mhz: observation.centralFrequency
    };
    if (observation.imageWeighting === IW_BRIGGS) {
      params['robustness'] = getRobustness();
    }
    return params;
  };

  const getParamSpectralLOW = (): WeightingLowSpectralQuery => {
    const params = {
      spectral_mode: OBSERVATION_TYPE_SENSCALC[inMode].toLowerCase(),
      weighting_mode: getWeightingMode(),
      subarray_configuration: getSubArray(),
      pointing_centre: pointingCentre(),
      freq_centre_mhz: observation.centralFrequency
    };
    if (observation.imageWeighting === IW_BRIGGS) {
      params['robustness'] = getRobustness();
    }
    return params;
  };

  const getParamContinuumLOW = (): WeightingLowContinuumQuery => {
    const params = {
      spectral_mode: OBSERVATION_TYPE_SENSCALC[inMode].toLowerCase(),
      weighting_mode: getWeightingMode(),
      subarray_configuration: getSubArray(),
      pointing_centre: pointingCentre(),
      freq_centre_mhz: observation.centralFrequency
    };
    if (observation.imageWeighting === IW_BRIGGS) {
      params['robustness'] = getRobustness();
    }
    return params;
  };

  /*************************************************************************************************************************/

  const getParams = (): WeightingQuery => {
    if (!isZoom()) {
      return isLow() ? getParamContinuumLOW() : getParamContinuumMID();
    } else if (isSpectral()) {
      return isLow() ? getParamSpectralLOW() : getParamSpectralMID();
    } else {
      return isLow() ? getParamZoomLOW() : getParamZoomMID();
    }
  };

  const getQueryParams = (): URLSearchParams => {
    const params = getParams();
    const urlSearchParams = new URLSearchParams();
    for (let key in params) urlSearchParams.append(key, params[key]);
    return urlSearchParams;
  };

  const getMockData = () => {
    if (observation.telescope === TELESCOPE_LOW_NUM) {
      if (!isZoom()) {
        return MockResponseLowWeightingContinuum;
      } else if (isSpectral()) {
        return MockResponseLowWeightingLineSpectral;
      } else {
        return MockResponseLowWeightingLineZoom;
      }
    }
    return observation.type ? MockResponseMidWeightingContinuum : MockResponseMidWeightingLine;
  };

  if (USE_LOCAL_DATA_SENSITIVITY_CALC) {
    return getMockData();
  }

  try {
    const path = `${apiUrl}${getTelescope()}/${getMode()}${URL_WEIGHTING}?${getQueryParams()}`;
    const result = await axios.get(path, AXIOS_CONFIG);
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : result.data;
  } catch (e) {
    const errorObject = {
      title: e?.response?.data?.title,
      detail: e?.response?.data?.detail
    };
    return { error: errorObject };
  }
}

export default GetWeighting;
