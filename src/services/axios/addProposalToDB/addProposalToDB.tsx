// import axios from 'axios';
// import { SKA_PHT_API_URL, USE_LOCAL_DATA } from '../../../utils/constants';
import { Proposal } from '../../types/proposal';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function AddProposalToDB(_inData: Proposal) {
  // console.log('TODO : We need to use this', inData);
  return true;

  /*
  const apiUrl = SKA_PHT_API_URL;
  const URL_LIST = '/proposal';
  const config = {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  };

  // TODO : Do this properly
  if (USE_LOCAL_DATA) {
    return MockProposal;
  }

  try {
    const result = await axios.get(`${apiUrl}${URL_LIST}`, config);
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : result;
  } catch (e) {
    return 'error.API_NOT_AVAILABLE';
  }
  */
}

export default AddProposalToDB;