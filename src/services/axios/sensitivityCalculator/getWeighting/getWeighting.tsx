import axios from 'axios';
import { USE_LOCAL_DATA, SKA_SENSITIVITY_CALCULATOR_API_URL } from '../../../../utils/constants';
import {
  MockQuerryMidWeightingContinuum,
  MockQuerryMidWeightingLine,
  MockResponseMidWeightingContinuum,
  MockResponseMidWeightingLine
} from './mockResponseMidWeighting';
import {
  MockQuerryLowWeightingContinuum,
  MockQuerryLowWeightingLine,
  MockResponseLowWeightingContinuum,
  MockResponseLowWeightingLine
} from './mockResponseLowWeighting';
import Observation from 'utils/types/observation';
import { OBSERVATION } from '../../../../utils/constants';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function GetWeighting(telescope, mode, observation: Observation) {
  const apiUrl = SKA_SENSITIVITY_CALCULATOR_API_URL;
  // Telescope URLS
  let URL_TELESCOPE;
  const URL_MID = `mid/`;
  const URL_LOW = `low/`;
  // Mode URLs
  const URL_ZOOM = `line/`;
  const URL_CONTINUUM = `continuum/`;
  let URL_ZOOM_VALUE;
  let URL_CONTINUUM_VALUE;
  let URL_MODE;
  const URL_WEIGHTING = `weighting`;
  // Mocks query strings parameters
  let QUERY_STRING_PARAMETERS;
  let MOCK_CONTINUUM_QUERY;
  let MOCK_ZOOM_QUERY;
  // Mocks responses
  let MOCK_RESPONSE;
  let MOCK_RESPONSE_CONTINUUM;
  let MOCK_RESPONSE_ZOOM;
  const config = {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  };

  function mapQueryMidWeighting() {
    return {
      frequency: observation.central_frequency,
      zoom_frequencies: observation.central_frequency,
      dec_str: '00:00:00.0', // to get from target
      weighting: observation.image_weighting,
      array_configuration: OBSERVATION.array[0].subarray.find(
        obj => obj.value === observation.subarray
      ).label,
      calculator_mode: observation.type,
      taper: observation.tapering
    };
  }

  function mapQueryMidWeightingLine() {
    return {
      frequency: observation.central_frequency,
      zoom_frequencies: observation.central_frequency,
      dec_str: '00:00:00.0', // to get from target
      weighting: observation.image_weighting,
      array_configuration: OBSERVATION.array[0].subarray.find(
        obj => obj.value === observation.subarray
      ).label,
      calculator_mode: 'line',
      taper: observation.tapering
    };
  }

  function getSubarrayType(_subArray: string, telescope: string) {
    const subArray = _subArray.replace('*', '').replace('(core only)', '');
    const star = _subArray.includes('*') ? 'star' : '';
    const type = _subArray.includes('core') ? 'core_only' : 'all';
    return `${telescope}_${subArray}${star}_${type}`.replace(' ', '');
  }

  function mapQueryLowWeighting() {
    const subArray = OBSERVATION.array[1].subarray.find(obj => obj.value === observation.subarray)
      .label;
    return {
      weighting_mode: observation.image_weighting,
      subarray_configuration: getSubarrayType(subArray, 'LOW'), // 'for example: LOW_AA4_all',
      pointing_centre: '00:00:00.0 00:00:00.0', // to get from target
      freq_centre: observation.central_frequency
    };
  }

  function mapQueryLowWeightingLine() {
    // same as mapQueryLowWeighting TODO: refactor a to use 1 function
    const subArray = OBSERVATION.array[1].subarray.find(obj => obj.value === observation.subarray)
      .label;
    return {
      weighting_mode: observation.image_weighting,
      subarray_configuration: getSubarrayType(subArray, 'LOW'), // 'for example: LOW_AA4_all',
      pointing_centre: '00:00:00.0 00:00:00.0', // to get from target
      freq_centre: observation.central_frequency
    };
  }

  // TODO
  /*
  - use 1 function for Low
  - figure which telescope we are using and check if the assumption 0=MID 1=LOW in consts/OBSERVATION is still valid
  */

  console.log('telescope', telescope);
  console.log('observation.telescope', observation.telescope);
  switch (telescope) {
    case 'Mid':
      URL_TELESCOPE = URL_MID;
      switch (mode) {
        case 'Continuum':
          URL_MODE = '';
          QUERY_STRING_PARAMETERS = mapQueryMidWeighting();
          // MOCK_RESPONSE = MockQuerryMidWeightingContinuum;
          MOCK_RESPONSE = mapQueryMidWeighting();
          break;
        case 'Zoom':
          URL_MODE = '';
          QUERY_STRING_PARAMETERS = mapQueryMidWeightingLine();
          // MOCK_RESPONSE = MockQuerryMidWeightingLine;
          MOCK_RESPONSE = mapQueryMidWeightingLine();
          break;
        default:
        // 'Invalid mode' // TODO return error properly for user
      }
      break;
    case 'Low':
      URL_TELESCOPE = URL_LOW;
      switch (mode) {
        case 'Continuum':
          URL_MODE = URL_CONTINUUM;
          QUERY_STRING_PARAMETERS = mapQueryLowWeighting();
          // MOCK_RESPONSE = MockQuerryLowWeightingContinuum;
          MOCK_RESPONSE = mapQueryLowWeighting();
          console.log('MOCK_RESPONSE', MOCK_RESPONSE);
          console.log('OBSERVATION', observation);
          break;
        case 'Zoom':
          URL_MODE = URL_ZOOM;
          QUERY_STRING_PARAMETERS = mapQueryLowWeightingLine();
          // MOCK_RESPONSE = MockQuerryLowWeightingLine;
          MOCK_RESPONSE = mapQueryLowWeightingLine();
          break;
        default:
        // 'Invalid mode' // TODO return error properly for user
      }
      break;
    default:
    // 'Invalid telescope' // TODO return error properly for user
  }

  switch (telescope) {
    case 'Mid':
      URL_TELESCOPE = URL_MID;
      URL_CONTINUUM_VALUE = '';
      URL_ZOOM_VALUE = '';
      // Mocks queries declarations can be removed once queries passed to service
      MOCK_CONTINUUM_QUERY = MockQuerryMidWeightingContinuum;
      MOCK_ZOOM_QUERY = MockQuerryMidWeightingLine;
      MOCK_RESPONSE_CONTINUUM = MockResponseMidWeightingContinuum;
      MOCK_RESPONSE_ZOOM = MockResponseMidWeightingLine;
      break;
    case 'Low':
      URL_TELESCOPE = URL_LOW;
      URL_CONTINUUM_VALUE = URL_CONTINUUM;
      URL_ZOOM_VALUE = URL_ZOOM;
      // Mocks queries declarations can be removed once queries passed to service
      MOCK_CONTINUUM_QUERY = MockQuerryLowWeightingContinuum;
      MOCK_ZOOM_QUERY = MockQuerryLowWeightingLine;
      MOCK_RESPONSE_CONTINUUM = MockResponseLowWeightingContinuum;
      MOCK_RESPONSE_ZOOM = MockResponseLowWeightingLine;
      break;
    default:
  }

  switch (mode) {
    case 'Continuum':
      QUERY_STRING_PARAMETERS = MOCK_CONTINUUM_QUERY;
      URL_MODE = URL_CONTINUUM_VALUE;
      // Mocks queries declarations can be removed once queries passed to service
      MOCK_RESPONSE = MOCK_RESPONSE_CONTINUUM;
      break;
    case 'Zoom':
      QUERY_STRING_PARAMETERS = MOCK_ZOOM_QUERY;
      URL_MODE = URL_ZOOM_VALUE;
      // Mocks queries declarations can be removed once queries passed to service
      MOCK_RESPONSE = MOCK_RESPONSE_ZOOM;
      break;
    default:
  }

  if (USE_LOCAL_DATA) {
    return MOCK_RESPONSE;
  }

  try {
    const queryString = new URLSearchParams(QUERY_STRING_PARAMETERS).toString();
    const result = await axios.get(
      `${apiUrl}${URL_TELESCOPE}${URL_MODE}${URL_WEIGHTING}?${queryString}`,
      config
    );
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : result.data;
  } catch (e) {
    return { error: e.message };
  }
}

export default GetWeighting;
