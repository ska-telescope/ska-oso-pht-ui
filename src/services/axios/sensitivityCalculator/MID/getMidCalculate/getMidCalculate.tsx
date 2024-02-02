import axios from 'axios';
import { USE_LOCAL_DATA, SKA_SENSITIVITY_CALCULATOR_API_URL } from '../../../../../utils/constants';
import {MockQuerryMidCalculate, MockQuerryMidCalculateZoom, MockResponseMidCalculate} from './mockResponseMidCalculate';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function GetMidCalculate(mode) {
  const apiUrl = SKA_SENSITIVITY_CALCULATOR_API_URL;
  const URL_MID = `mid/`;
  const URL_CALCULATE = `calculate`;
  let QUERRY_STRING_PARAMETERS;
  const config = {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  };

  switch (mode) {
    case 'Continuum':
        QUERRY_STRING_PARAMETERS = MockQuerryMidCalculate;
        break;
    case 'Zoom':
        QUERRY_STRING_PARAMETERS = MockQuerryMidCalculateZoom;
        break
    default:
  }

  if (USE_LOCAL_DATA) {
    return MockResponseMidCalculate;
  }

  try {
    const queryString = new URLSearchParams(QUERRY_STRING_PARAMETERS).toString();
    const result = await axios.get(`${apiUrl}${URL_MID}${URL_CALCULATE}?${queryString}`, config);
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : result;
  } catch (e) {
    return { error: e.message };
  }
}

export default GetMidCalculate;
