import axios from 'axios';
import { USE_LOCAL_DATA, SKA_SENSITIVITY_CALCULATOR_API_URL } from '../../../../../utils/constants';
import {MockQuerryMidWeightingContinuum, MockQuerryMidWeightingLine, MockResponseMidWeightingContinuum, MockResponseMidWeightingLine} from './mockResponseMidWeighting';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function GetMidWeighting(mode) {
  const apiUrl = SKA_SENSITIVITY_CALCULATOR_API_URL;
  const URL_MID = `mid/`;
  const URL_WEIGHTING = `weighting`;
  let QUERRY_STRING_PARAMETERS;
  let MockResponse;
  const config = {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  };

  switch (mode) {
    case 'Continuum':
        QUERRY_STRING_PARAMETERS = MockQuerryMidWeightingContinuum;
        MockResponse = MockResponseMidWeightingContinuum;
        break;
    case 'Zoom':
        QUERRY_STRING_PARAMETERS = MockQuerryMidWeightingLine;
        MockResponse = MockResponseMidWeightingLine;
        break
    default:
  }

  if (USE_LOCAL_DATA) {
    return MockResponse;
  }

  try {
    const queryString = new URLSearchParams(QUERRY_STRING_PARAMETERS).toString();
    const result = await axios.get(`${apiUrl}${URL_MID}${URL_WEIGHTING}?${queryString}`, config);
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : result;
  } catch (e) {
    return { error: e.message };
  }
}

export default GetMidWeighting;
