import axios from 'axios';
import { USE_LOCAL_DATA, SKA_SENSITIVITY_CALCULATOR_API_URL } from '../../../../utils/constants';
import {
  MockQueryMidCalculate,
  MockQueryMidCalculateZoom,
  MockResponseMidCalculateZoom,
  MockResponseMidCalculate
} from './mockResponseMidCalculate';
import {
  MockQueryLowCalculate,
  MockQueryLowCalculateZoom,
  MockResponseLowCalculate,
  MockResponseLowCalculateZoom
} from './mockResponseLowCalculate';
import Observation from 'services/types/observation';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function GetCalculate(telescope, mode, observation) {
  // TODO: send QUERY_STRING_PARAMETERS to service instead of using MOCK QUERIES
  const apiUrl = SKA_SENSITIVITY_CALCULATOR_API_URL;
  // Telescope URLS
  let URL_TELESCOPE;
  const URL_MID = `mid/`;
  const URL_LOW = `low/`;
  // Mode URLs
  const URL_ZOOM = `zoom/`;
  const URL_CONTINUUM = `continuum/`;
  let URL_MODE;
  const URL_CALCULATE = `calculate`;
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

  function mapping(observation: Observation) {
    console.log('in mapping', observation);
  }

  switch (telescope) {
    case 'Mid':
      URL_TELESCOPE = URL_MID;
      switch (mode) {
        case 'Continuum':
          console.log('Mid telescope in Continuum mode');
          URL_MODE = '';
          QUERY_STRING_PARAMETERS = MockQueryMidCalculate;
          break;
        case 'Zoom':
          console.log('Mid telescope in Zoom mode');
          URL_MODE = '';
          QUERY_STRING_PARAMETERS = MockQueryMidCalculateZoom;
          break;
        default:
          console.log('Invalid mode');
      }
      break;
    case 'Low':
      URL_TELESCOPE = URL_LOW;
      switch (mode) {
        case 'Continuum':
          console.log('Low telescope in Continuum mode');
          URL_MODE = URL_CONTINUUM;
          QUERY_STRING_PARAMETERS = MockQueryLowCalculate;
          break;
        case 'Zoom':
          console.log('Low telescope in Zoom mode');
          URL_MODE = URL_ZOOM;
          QUERY_STRING_PARAMETERS = MockQueryLowCalculateZoom;
          break;
        default:
          console.log('Invalid mode');
      }
      break;
    default:
      console.log('Invalid telescope');
  }

  // let query = mapping(observation);
  mapping(observation);

  if (USE_LOCAL_DATA) {
    return MOCK_RESPONSE;
  }

  try {
    const queryString = new URLSearchParams(QUERY_STRING_PARAMETERS).toString();
    const result = await axios.get(
      `${apiUrl}${URL_TELESCOPE}${URL_MODE}${URL_CALCULATE}?${queryString}`,
      config
    );
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : result.data;
  } catch (e) {
    return { error: e.message };
  }
}

export default GetCalculate;
