import axios from 'axios';
import {
  MODE,
  OBSERVATION,
  USE_LOCAL_DATA,
  SKA_SENSITIVITY_CALCULATOR_API_URL,
  AXIOS_CONFIG
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

const TELESCOPE_LOW_NUM = 1;
const URL_WEIGHTING = `weighting`;

async function GetWeighting(observation: Observation, inMode: number) {
  const apiUrl = SKA_SENSITIVITY_CALCULATOR_API_URL;

  const getTelescope = () =>
    observation.telescope === TELESCOPE_LOW_NUM ? TELESCOPE_LOW.code : TELESCOPE_MID.code;

  const getMode = () => {
    if (getTelescope() === TELESCOPE_LOW.code) {
      return MODE[inMode].toLowerCase() + '/';
    }
    return '';
  };

  /*********************************************************** MID *********************************************************/

  function mapQueryMidWeighting(): URLSearchParams {
    const array = OBSERVATION.array.find(obj => (obj.value = observation.telescope));
    const params = new URLSearchParams({
      frequency: observation.central_frequency?.toString(),
      zoom_frequencies: observation.central_frequency?.toString(),
      dec_str: '00:00:00.0', // to get from target
      weighting: OBSERVATION.ImageWeighting.find(
        obj => obj.value === observation.image_weighting
      ).label.toLowerCase(),
      array_configuration: array.subarray.find(obj => obj.value === observation.subarray).label,
      calculator_mode: MODE[inMode],
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
        obj => obj.value === observation.image_weighting
      )?.label.toLowerCase(),
      subarray_configuration: sensCalHelpers.format.getLowSubarrayType(subArray, 'LOW'), // 'for example: LOW_AA4_all',
      pointing_centre: '00:00:00.0 00:00:00.0', // to get from target
      freq_centre: observation.central_frequency?.toString()
    });
    return params;
  }

  /*************************************************************************************************************************/

  const getQueryParams = () => {
    return getTelescope() === TELESCOPE_LOW.code ? mapQueryLowWeighting() : mapQueryMidWeighting();
  };

  const getMockData = () => {
    if (getTelescope() === TELESCOPE_LOW.code) {
      return observation.type ? MockResponseLowWeightingContinuum : MockResponseLowWeightingLine;
    }
    return observation.type ? MockResponseMidWeightingContinuum : MockResponseMidWeightingLine;
  };

  if (USE_LOCAL_DATA) {
    return getMockData();
  }

  try {
    const result = await axios.get(
      `${apiUrl}${getTelescope()}/${getMode()}${URL_WEIGHTING}?${getQueryParams()}`,
      AXIOS_CONFIG
    );
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : result.data;
  } catch (e) {
    return { error: e.message };
  }
}

export default GetWeighting;
