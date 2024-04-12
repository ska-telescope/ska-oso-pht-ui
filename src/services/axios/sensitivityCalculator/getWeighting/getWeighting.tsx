import axios from 'axios';
import { USE_LOCAL_DATA, SKA_SENSITIVITY_CALCULATOR_API_URL } from '../../../../utils/constants';
import {
  MockResponseMidWeightingContinuum,
  MockResponseMidWeightingLine
} from './mockResponseMidWeighting';
import {
  MockResponseLowWeightingContinuum,
  MockResponseLowWeightingLine
} from './mockResponseLowWeighting';
import Observation from 'utils/types/observation';
import { OBSERVATION } from '../../../../utils/constants';
import sensCalHelpers from '../sensCalHelpers';

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
  let URL_MODE;
  const URL_WEIGHTING = `weighting`;
  // Mocks query strings parameters
  let QUERY_STRING_PARAMETERS: URLSearchParams;
  // Mocks responses
  let MOCK_RESPONSE;
  const config = {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  };

  function mapQueryMidWeighting(calculatore_mode: string): URLSearchParams {
    const array = OBSERVATION.array.find(obj => (obj.value = observation.telescope));
    const params = new URLSearchParams({
      frequency: observation.central_frequency?.toString(),
      zoom_frequencies: observation.central_frequency?.toString(),
      dec_str: '00:00:00.0', // to get from target
      weighting: OBSERVATION.ImageWeighting.find(
        obj => obj.value === observation.image_weighting
      ).label.toLowerCase(),
      array_configuration: array.subarray.find(obj => obj.value === observation.subarray).label,
      calculator_mode: calculatore_mode,
      taper: observation.tapering?.toString()
    });
    return params;
  }

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
          MOCK_RESPONSE = MockResponseMidWeightingLine;
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
          break;
        case 'Zoom':
          URL_MODE = URL_ZOOM;
          QUERY_STRING_PARAMETERS = mapQueryLowWeighting();
          MOCK_RESPONSE = MockResponseLowWeightingLine;
          break;
        default:
        // 'Invalid mode' // TODO return error properly for user
      }
      break;
    default:
    // 'Invalid telescope' // TODO return error properly for user
  }

  if (true || USE_LOCAL_DATA) {
    // TODO - TREVOR
    return MOCK_RESPONSE;
  }

  try {
    const queryString = new URLSearchParams(QUERY_STRING_PARAMETERS)?.toString();
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
