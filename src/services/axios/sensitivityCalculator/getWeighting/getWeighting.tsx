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

  function mapQueryMidWeighting(calculatore_mode: string) {
    console.log('TELESCOPE', telescope);
    const array = OBSERVATION.array.find(obj => (obj.value = observation.telescope));
    return {
      frequency: observation.central_frequency,
      zoom_frequencies: observation.central_frequency,
      dec_str: '00:00:00.0', // to get from target
      weighting: OBSERVATION.ImageWeighting.find(
        obj => obj.value === observation.image_weighting
      ).label.toLowerCase(),
      array_configuration: array.subarray.find(obj => obj.value === observation.subarray).label,
      calculator_mode: calculatore_mode,
      taper: observation.tapering
    };
  }

  /*
  returns string such as 'LOW_AA4_all',
  */
  function getLowSubarrayType(_subArray: string, telescope: string): string {
    let subArray = _subArray.replace('*', '').replace('(core only)', ''); // remove * // remove (core only)
    subArray = subArray.replace(/(\d+)\.(\d+)/g, '$1$2'); // remove dot following a number
    const star = _subArray.includes('*') ? 'star' : ''; // add star for *
    const type = _subArray.includes('core') ? 'core_only' : 'all';
    return `${telescope}_${subArray}${star}_${type}`.replace(' ', '');
  }

  // same for mapQueryLowWeighting and mapQueryLowWeightingLine
  function mapQueryLowWeighting() {
    const array = OBSERVATION.array.find(obj => (obj.value = observation.telescope));
    const subArray = array.subarray.find(obj => obj.value === observation.subarray).label;
    return {
      weighting_mode: OBSERVATION.ImageWeighting.find(
        obj => obj.value === observation.image_weighting
      ).label.toLowerCase(),
      subarray_configuration: getLowSubarrayType(subArray, 'LOW'), // 'for example: LOW_AA4_all',
      pointing_centre: '00:00:00.0 00:00:00.0', // to get from target
      freq_centre: observation.central_frequency
    };
  }

  /*
  - TODO: put functions replicated in weighting and calculate in a common place 
  */

  console.log('telescope', telescope);
  console.log('observation.telescope', observation.telescope);
  switch (telescope) {
    case 'Mid':
      URL_TELESCOPE = URL_MID;
      switch (mode) {
        case 'Continuum':
          URL_MODE = '';
          QUERY_STRING_PARAMETERS = mapQueryMidWeighting('continuum');
          MOCK_RESPONSE = MockResponseMidWeightingContinuum;
          break;
        case 'Zoom':
          URL_MODE = '';
          QUERY_STRING_PARAMETERS = mapQueryMidWeighting('line');
          // QUERY_STRING_PARAMETERS = mapQueryMidWeightingLine();
          MOCK_RESPONSE = MockQuerryMidWeightingLine;
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
          MOCK_RESPONSE = MockResponseLowWeightingContinuum;
          console.log('MOCK_RESPONSE', MOCK_RESPONSE);
          console.log('OBSERVATION', observation);
          break;
        case 'Zoom':
          URL_MODE = URL_ZOOM;
          QUERY_STRING_PARAMETERS = mapQueryLowWeighting();
          MOCK_RESPONSE = MockQuerryLowWeightingLine;
          break;
        default:
        // 'Invalid mode' // TODO return error properly for user
      }
      break;
    default:
    // 'Invalid telescope' // TODO return error properly for user
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
