import axios from 'axios';
import { TELESCOPE_LOW, TELESCOPE_MID } from '@ska-telescope/ska-gui-components';
import {
  OBSERVATION,
  USE_LOCAL_DATA_SENSITIVITY_CALC,
  SKA_SENSITIVITY_CALCULATOR_API_URL,
  AXIOS_CONFIG,
  TELESCOPE_LOW_NUM,
  OBSERVATION_TYPE_SENSCALC
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
import sensCalHelpers from '../sensCalHelpers';
import Target from '../../../../utils/types/target';

const URL_WEIGHTING = `weighting`;

async function GetWeighting(observation: Observation, target: Target, inMode: number) {
  const apiUrl = SKA_SENSITIVITY_CALCULATOR_API_URL;

  const getTelescope = () =>
    observation.telescope === TELESCOPE_LOW_NUM ? TELESCOPE_LOW.code : TELESCOPE_MID.code;

  const getMode = () =>
    observation.telescope === TELESCOPE_LOW_NUM
      ? `${OBSERVATION_TYPE_SENSCALC[observation.type].toLowerCase()}/`
      : '';

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

  /** ********************************************************* MID ******************************************************** */

  function mapQueryMidWeighting(): URLSearchParams {
    const weighting = OBSERVATION.ImageWeighting.find(
      obj => obj.value === observation.imageWeighting
    );

    const splitCentralFrequency: string[] = observation.centralFrequency.split(' ');

    const params = {
      frequency: sensCalHelpers.format
        .convertFrequencyToHz(splitCentralFrequency[0], splitCentralFrequency[1])
        .toString(),
      zoom_frequencies: sensCalHelpers.format
        .convertFrequencyToHz(splitCentralFrequency[0], splitCentralFrequency[1])
        .toString(),
      dec_str: declination(),
      weighting: weighting?.label.toLowerCase(),
      array_configuration: getSubArray(),
      calculator_mode: OBSERVATION_TYPE_SENSCALC[inMode],
      taper: observation.tapering?.toString()
    };
    const urlSearchParams = new URLSearchParams();
    for (const key in params) urlSearchParams.append(key, params[key]);

    return urlSearchParams;
  }

  /** ********************************************************* LOW ******************************************************** */

  function pointingCentre() {
    return `${rightAscension()} ${declination()}`;
  }

  function mapQueryLowWeighting(): URLSearchParams {
    const params = {
      weighting_mode: OBSERVATION.ImageWeighting.find(
        obj => obj.value === observation.imageWeighting
      )?.label.toLowerCase(),
      subarray_configuration: getSubArray(),
      pointing_centre: pointingCentre(),
      freq_centre: observation.centralFrequency.split(' ')[0]?.toString()
    };
    const urlSearchParams = new URLSearchParams();
    for (const key in params) urlSearchParams.append(key, params[key]);

    return urlSearchParams;
  }

  /** ********************************************************************************************************************** */

  const getQueryParams = () =>
    observation.telescope === TELESCOPE_LOW_NUM ? mapQueryLowWeighting() : mapQueryMidWeighting();

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
    const result = await axios.get(
      `${apiUrl}${getTelescope()}/${getMode()}${URL_WEIGHTING}?${getQueryParams()}`,
      AXIOS_CONFIG
    );
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : result.data;
  } catch (e) {
    const errorObject = {
      title: e.response.data.title,
      detail: e.response.data.detail
    };
    return { error: errorObject };
  }
}

export default GetWeighting;
