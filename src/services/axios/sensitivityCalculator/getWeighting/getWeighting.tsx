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
  IW_BRIGGS
} from '../../../../utils/constants';
import {
  MockResponseMidWeightingContinuum,
  MockResponseMidWeightingLine
} from './mockResponseMidWeighting';
import {
  MockResponseLowWeightingContinuum,
  MockResponseLowWeightingLine
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
  WeightingMidZoomQuery
} from '.././../../../utils/types/sensCalcWeightingQuery';

const URL_WEIGHTING = `weighting`;

async function GetWeighting(observation: Observation, target: Target, inMode: number, inIsSpectral=false) {
  const apiUrl = SKA_SENSITIVITY_CALCULATOR_API_URL;

  const isLow = () => observation.telescope === TELESCOPE_LOW_NUM;
  const isZoom = () => inMode === TYPE_ZOOM;
  const isSpectral = () => inIsSpectral
  console.log('isSpectral', isSpectral());

  const getTelescope = () => (isLow() ? TELESCOPE_LOW.code : TELESCOPE_MID.code);
  const getMode = () => OBSERVATION_TYPE_BACKEND[inMode].toLowerCase() + '/';

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

  function mapQueryMidWeighting(): URLSearchParams {
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

    const params = isZoom() ? getParamZoomMID() : getParamContinuumMID();
    const urlSearchParams = new URLSearchParams();
    for (let key in params) urlSearchParams.append(key, params[key]);
    return urlSearchParams;
  }

  /*********************************************************** LOW *********************************************************/

  function pointingCentre() {
    return rightAscension() + ' ' + declination();
  }

  const getParamZoomLOW = (): WeightingLowZoomQuery => {
    console.log('OBSERVATION_TYPE_SENSCALC[inMode].toLowerCase()', OBSERVATION_TYPE_SENSCALC[inMode].toLowerCase());
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
    console.log('OBSERVATION_TYPE_SENSCALC[inMode].toLowerCase()', OBSERVATION_TYPE_SENSCALC[inMode].toLowerCase());
    const params = {
      spectral_mode: OBSERVATION_TYPE_SENSCALC[inMode].toLowerCase(), // Not there for zoom but here for line
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

  // TODO
  /*
  Handle the difference of request between continuum line (spectral?) and zoom modes
    - line: add spectral_mode
    - line: freq_centre_mhz without 's'
    - url for request different: continuum instead of zoom for mode
  */

  // HERE
  const getParamContinuumLOW = (): WeightingLowContinuumQuery => {
    console.log('OBSERVATION_TYPE_SENSCALC[inMode].toLowerCase()', OBSERVATION_TYPE_SENSCALC[inMode].toLowerCase());
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

  function mapQueryLowWeighting(): URLSearchParams {
    // const params = isZoom() ? getParamZoomLOW() : getParamContinuumLOW();
    const params = !isZoom() ? getParamContinuumLOW() : isSpectral() ? getParamSpectralLOW() : getParamZoomLOW();
    const urlSearchParams = new URLSearchParams();
    for (let key in params) urlSearchParams.append(key, params[key]);

    return urlSearchParams;
  }

  /*************************************************************************************************************************/

  const getQueryParams = () => {
    return observation.telescope === TELESCOPE_LOW_NUM
      ? mapQueryLowWeighting()
      : mapQueryMidWeighting();
  };

  const getMockData = () => {
    if (observation.telescope === TELESCOPE_LOW_NUM) {
      return observation.type ? MockResponseLowWeightingContinuum : MockResponseLowWeightingLine;
    }
    return observation.type ? MockResponseMidWeightingContinuum : MockResponseMidWeightingLine;
  };

  if (USE_LOCAL_DATA_SENSITIVITY_CALC) {
    return getMockData();
  }

  const getModeUrl = () => {
    console.log('getMode(): ', getMode());
    if (!isZoom()) {
      return getMode() // continuum
    }
    if (isSpectral()) {
      return "continuum/"
    }
    if (isZoom()){
      return getMode() // zoom
    }
  }

  try {
    // const path = `${apiUrl}${getTelescope()}/${getMode()}${URL_WEIGHTING}?${getQueryParams()}`;
    const path = `${apiUrl}${getTelescope()}/${getModeUrl()}${URL_WEIGHTING}?${getQueryParams()}`;
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
