import axios from 'axios';
import { USE_LOCAL_DATA, SKA_SENSITIVITY_CALCULATOR_API_URL } from '../../../../../utils/constants';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function GetProposal(_id: number) {
  const apiUrl = SKA_SENSITIVITY_CALCULATOR_API_URL;
  const URL_MID = `/mid/`;
  const URL_CALCULATE = `/calculate/`;
  const config = {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  };

  try {
    const result = await axios.get(`${apiUrl}${URL_MID}${URL_CALCULATE}`, config);
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : result.data.proposal_info;
  } catch (e) {
    return { error: e.message };
  }
}

export default GetProposal;
