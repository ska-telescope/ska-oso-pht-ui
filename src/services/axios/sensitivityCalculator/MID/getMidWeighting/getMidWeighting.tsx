import axios from 'axios';
import { USE_LOCAL_DATA, SKA_SENSITIVITY_CALCULATOR_API_URL } from '../../../../../utils/constants';
import {MockQuerryMidWeightingContinuum, MockResponseMidWeightingContinuum, MockQuerryMidWeightingLine} from './mockResponseMidWeighting';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function GetMidWeighting(mode) {
  const apiUrl = SKA_SENSITIVITY_CALCULATOR_API_URL;
  const URL_MID = `mid/`;
  const URL_WEIGHTING = `weighting`;
  let QUERRY_STRING_PARAMETERS;
  const config = {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  };

  switch (mode) {
    case 'Continuum':
        QUERRY_STRING_PARAMETERS = MockQuerryMidWeightingContinuum;
        break;
    case 'Zoom':
        QUERRY_STRING_PARAMETERS = MockQuerryMidWeightingLine;
        break
    default:
  }

  if (USE_LOCAL_DATA) {
    return MockQuerryMidWeightingContinuum;
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
