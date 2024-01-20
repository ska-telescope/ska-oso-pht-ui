// import axios from 'axios';
// import { SKA_PHT_API_URL, USE_LOCAL_DATA } from '../../../utils/constants';
import axios from 'axios';
import { SKA_PHT_API_URL, USE_LOCAL_DATA } from '../../../utils/constants';
import { Proposal } from '../../types/proposal';
// import MockProposal from '../getProposal/mockProposal';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function AddProposalToDB(_inData: Proposal) {
  // console.log('TODO : We need to use this', inData);
  return true;

  const apiUrl = SKA_PHT_API_URL;
  const config = {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  };

  // TODO : Do this properly
  /*
  if (USE_LOCAL_DATA) {
    return MockProposal;
  }
  */

  try {
    const result = await axios.put(`${apiUrl}`, _inData, config);
    console.log('success service ', result); 
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : result.data;
  } catch (e) {
    console.log('error service ', e.message);
    return { error: e.message };
  }
}

export default AddProposalToDB;
