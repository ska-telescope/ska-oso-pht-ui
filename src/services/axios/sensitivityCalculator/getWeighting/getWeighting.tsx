import axios from 'axios';
import {
  OBSERVATION_TYPE_BACKEND,
  OBSERVATION,
  USE_LOCAL_DATA_SENSITIVITY_CALC,
  SKA_SENSITIVITY_CALCULATOR_API_URL,
  AXIOS_CONFIG,
  TELESCOPE_LOW_NUM
} from '../../../../utils/constants';
import {
  MockResponseMidWeightingContinuum,
  MockResponseMidWeightingLine
} from './mockResponseMidWeighting';
import {
  MockResponseLowWeightingContinuum,
  MockResponseLowWeightingLine
} from './mockResponseLowWeighting';
import Observation from 'utils/types/observation';
import sensCalHelpers from '../sensCalHelpers';
import { TELESCOPE_LOW, TELESCOPE_MID } from '@ska-telescope/ska-gui-components';

const URL_WEIGHTING = `weighting`;

async function GetWeighting(observation: Observation, inMode: number) {
  const apiUrl = SKA_SENSITIVITY_CALCULATOR_API_URL;

  const getTelescope = () =>
    observation.telescope === TELESCOPE_LOW_NUM ? TELESCOPE_LOW.code : TELESCOPE_MID.code;

  const getMode = () =>
    observation.telescope === TELESCOPE_LOW_NUM
      ? OBSERVATION_TYPE_BACKEND[observation.type].toLowerCase() + '/'
      : '';

  /*********************************************************** MID *********************************************************/

  function mapQueryMidWeighting(): URLSearchParams {
    const array = OBSERVATION.array.find(obj => (obj.value = observation.telescope));
    const arrConfig = array.subarray.find(obj => obj.value === observation.subarray);
    const weighting = OBSERVATION.ImageWeighting.find(
      obj => obj.value === observation.imageWeighting
    );

    const params = new URLSearchParams({
      frequency: observation.centralFrequency,
      zoom_frequencies: observation.centralFrequency?.toString(),
      dec_str: '00:00:00.0', // to get from target
      weighting: weighting?.label.toLowerCase(),
      array_configuration: arrConfig?.label,
      calculator_mode: OBSERVATION_TYPE_BACKEND[inMode].toLowerCase(),
      taper: observation.tapering?.toString()
    });
    return params;
  }

  /*********************************************************** LOW *********************************************************/

  function mapQueryLowWeighting(): URLSearchParams {
    const array = OBSERVATION.array.find(obj => (obj.value = observation.telescope));
    const subArray = array.subarray.find(obj => obj.value === observation.subarray)?.label;
    const params = new URLSearchParams({
      weighting_mode: OBSERVATION.ImageWeighting.find(
        obj => obj.value === observation.imageWeighting
      )?.label.toLowerCase(),
      subarray_configuration: sensCalHelpers.format.getLowSubarrayType(subArray, 'LOW'), // 'for example: LOW_AA4_all',
      pointing_centre: '00:00:00.0 00:00:00.0', // to get from target
      freq_centre: observation.centralFrequency?.toString()
    });
    return params;
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
    const result = await axios.get(
      `${apiUrl}${getTelescope()}/${getMode()}${URL_WEIGHTING}?${getQueryParams()}`,
      AXIOS_CONFIG
    );
    console.log('TREVOR EXECUTE', result);
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
