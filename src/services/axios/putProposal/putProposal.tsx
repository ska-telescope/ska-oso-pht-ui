import axios from 'axios';
import { AXIOS_CONFIG, SKA_PHT_API_URL, USE_LOCAL_DATA } from '../../../utils/constants';
import { helpers } from '../../../utils/helpers';

async function PutProposal(proposal, status?) {
  if (window.Cypress || USE_LOCAL_DATA) {
    return 'success';
  }

  try {
    const URL_PATH = `/proposals/${proposal.id}`;
    // TODO: add testing for proposal conversion format
    const convertedProposal = helpers.transform.convertProposalToBackendFormat(proposal, status);
    const result = await axios.put(
      `${SKA_PHT_API_URL}${URL_PATH}`,
      convertedProposal,
      AXIOS_CONFIG
    );
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : result.data;
  } catch (e) {
    return { error: e.message };
  }
}

export default PutProposal;
