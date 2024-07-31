import axios from 'axios';
import {
  OBSERVATION,
  USE_LOCAL_DATA_SENSITIVITY_CALC,
  SKA_SENSITIVITY_CALCULATOR_API_URL,
  AXIOS_CONFIG,
  TELESCOPE_LOW_NUM,
  OBSERVATION_TYPE_SENSCALC,
  OBSERVATION_TYPE_BACKEND,
  TYPE_ZOOM
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
// import sensCalHelpers from '../sensCalHelpers';
import { TELESCOPE_LOW, TELESCOPE_MID } from '@ska-telescope/ska-gui-components';
import sensCalHelpers from '../sensCalHelpers';
import Target from '../../../../utils/types/target';

const URL_WEIGHTING = `weighting`;

async function GetWeighting(observation: Observation, target: Target, inMode: number) {
  const apiUrl = SKA_SENSITIVITY_CALCULATOR_API_URL;

  const isLow = () => observation.telescope === TELESCOPE_LOW_NUM;
  const isZoom = () => inMode === TYPE_ZOOM;

  const getTelescope = () => (isLow() ? TELESCOPE_LOW.code : TELESCOPE_MID.code);
  const getMode = () => (isLow() ? OBSERVATION_TYPE_BACKEND[inMode].toLowerCase() + '/' : '');

  const getWeightingMode = () =>
    OBSERVATION.ImageWeighting.find(
      obj => obj.value === observation.imageWeighting
    )?.label.toLowerCase();

  const getRobustness = () => 0; // TODO

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
    const weighting = OBSERVATION.ImageWeighting.find(
      obj => obj.value === observation.imageWeighting
    );

    const params = {
      frequency: sensCalHelpers.format
        .convertFrequencyToHz(
          observation.centralFrequency,
          sensCalHelpers.map.getFrequencyAndBandwidthUnits(
            observation.centralFrequencyUnits,
            observation.telescope
          )
        )
        .toString(),
      zoom_frequencies: sensCalHelpers.format
        .convertFrequencyToHz(
          observation.centralFrequency,
          sensCalHelpers.map.getFrequencyAndBandwidthUnits(
            observation.centralFrequencyUnits,
            observation.telescope
          )
        )
        .toString(),
      dec_str: declination(),
      weighting: weighting?.label.toLowerCase(),
      array_configuration: getSubArray(),
      calculator_mode: OBSERVATION_TYPE_SENSCALC[inMode],
      taper: observation.tapering
    };
    const urlSearchParams = new URLSearchParams();
    for (let key in params) urlSearchParams.append(key, params[key]);

    return urlSearchParams;
  }

  /*********************************************************** LOW *********************************************************/

  function pointingCentre() {
    return rightAscension() + ' ' + declination();
  }

  function mapQueryLowWeighting(): URLSearchParams {
    let params = null;
    if (isZoom()) {
      params = {
        weighting_mode: getWeightingMode(),
        robustness: getRobustness(),
        subarray_configuration: getSubArray(),
        pointing_centre: pointingCentre(),
        freq_centres_mhz: observation.centralFrequency
      };
    } else {
      params = {
        spectral_mode: OBSERVATION_TYPE_SENSCALC[inMode].toLowerCase(),
        weighting_mode: getWeightingMode(),
        robustness: getRobustness(),
        subarray_configuration: getSubArray(),
        pointing_centre: pointingCentre(),
        freq_centre_mhz: observation.centralFrequency
        // TODO : subband_freq_centres_mhz:
      };
    }
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
