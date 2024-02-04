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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function GetCalculate(telescope, mode) {
  // TODO: send QUERY_STRING_PARAMETERS to service instead of using MOCK QUERIES
  const apiUrl = SKA_SENSITIVITY_CALCULATOR_API_URL;
  // Telescope URLS
  let URL_TELESCOPE;
  const URL_MID = `mid/`;
  const URL_LOW = `low/`;
  // Mode URLs
  const URL_ZOOM = `zoom/`;
  const URL_CONTINUUM = `continuum/`;
  let URL_ZOOM_VALUE;
  let URL_CONTINUUM_VALUE;
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

  switch (telescope) {
    case 'Mid':
      URL_TELESCOPE = URL_MID;
      URL_CONTINUUM_VALUE = '';
      URL_ZOOM_VALUE = '';
      // Mocks queries declarations can be removed once queries passed to service
      MOCK_CONTINUUM_QUERY = MockQueryMidCalculate;
      MOCK_ZOOM_QUERY = MockQueryMidCalculateZoom;
      MOCK_RESPONSE_CONTINUUM = MockResponseMidCalculate;
      MOCK_RESPONSE_ZOOM = MockResponseMidCalculateZoom;
      break;
    case 'Low':
      URL_TELESCOPE = URL_LOW;
      URL_CONTINUUM_VALUE = URL_CONTINUUM;
      URL_ZOOM_VALUE = URL_ZOOM;
      // Mocks queries declarations can be removed once queries passed to service
      MOCK_CONTINUUM_QUERY = MockQueryLowCalculate;
      MOCK_ZOOM_QUERY = MockQueryLowCalculateZoom;
      MOCK_RESPONSE_CONTINUUM = MockResponseLowCalculate;
      MOCK_RESPONSE_ZOOM = MockResponseLowCalculateZoom;
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
      `${apiUrl}${URL_TELESCOPE}${URL_MODE}${URL_CALCULATE}?${queryString}`,
      config
    );
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : result.data;
  } catch (e) {
    return { error: e.message };
  }
}

export default GetCalculate;
