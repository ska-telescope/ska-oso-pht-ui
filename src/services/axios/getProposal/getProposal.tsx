import axios from 'axios';
import { SKA_PHT_API_URL, USE_LOCAL_DATA } from '../../../utils/constants';
import MockProposal from './mockProposal';

const GetProposal = () => MockProposal;

async function GetProposalAsync() {
  const apiUrl = SKA_PHT_API_URL;
  const URL_LIST = '/proposal';
  const config = {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  };

  // TODO : Do this properly
  if (true || USE_LOCAL_DATA) {
    console.log("USE_LOCAL_DATA: Loading MockStatus");
    console.log(MockProposal);
    return MockProposal;
  }

  try {
    const result = await axios.get(`${apiUrl}${URL_LIST}`, config);
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : result;
  } catch (e) {
    return 'error.API_NOT_AVAILABLE';
  }
}

export default GetProposal;
