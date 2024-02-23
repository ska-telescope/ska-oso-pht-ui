import axios from 'axios';
import { SKA_PHT_API_URL, USE_LOCAL_DATA } from '../../../utils/constants';
import MockProposals from './mockProposals';
import { ProposalsIN } from '../../../services/types/proposals';

// TODO : Need to do this properly
const getPI = (inValue: any) => {
  return 'THE PI NAME';
};

function mappingList(inRec: ProposalsIN[]) {
  const output = [];
  for (let i = 0; i < inRec.length; i++) {
    const rec = {
      id: inRec[i].prsl_id,
      title: inRec[i].proposal_info.title,
      cycle: inRec[i].proposal_info.cycle,
      pi: getPI(inRec[i].proposal_info.investigator),
      cpi: 'CPI',
      status: inRec[i].status,
      lastUpdated: new Date(),
      telescope: 'N/A'
    };
    output.push(rec);
  }
  return output;
}

export function GetMockProposalList() {
  return mappingList(MockProposals);
}

async function GetProposalList() {
  const apiUrl = SKA_PHT_API_URL;
  const LIST_QUERY = 'DefaultUser'
  const URL_LIST = `/proposals/list/${LIST_QUERY}`;
  const config = {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  };

  if (USE_LOCAL_DATA) {
    return GetMockProposalList();
  }

  try {
    const result = await axios.get(`${apiUrl}${URL_LIST}`, config);
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : mappingList(result.data);
  } catch (e) {
    return { error: e.message };
  }
}

export default GetProposalList;
