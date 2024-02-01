import axios from 'axios';
import { USE_LOCAL_DATA, SKA_SENSITIVITY_CALCULATOR_API_URL } from '../../../../../utils/constants';
import {MockQuerryMidCalculate, MockResponseMidCalculate} from './mockResponseMidCalculate';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function GetMidCalculate() {
  const apiUrl = SKA_SENSITIVITY_CALCULATOR_API_URL;
  const URL_MID = `mid/`;
  const URL_CALCULATE = `calculate`;
  const config = {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  };

  if (USE_LOCAL_DATA) {
    return MockResponseMidCalculate;
  }

  try {
    const queryString = new URLSearchParams(MockQuerryMidCalculate).toString();
    const result = await axios.get(`${apiUrl}${URL_MID}${URL_CALCULATE}?${queryString}`, config);
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : result;
  } catch (e) {
    return { error: e.message };
  }
}

export default GetMidCalculate;
