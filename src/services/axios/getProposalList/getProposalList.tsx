import axios from 'axios';
import { AXIOS_CONFIG, SKA_PHT_API_URL, USE_LOCAL_DATA } from '../../../utils/constants';
import MockProposals from './mockProposals';
import Proposals, { ProposalsBackend } from '../../../utils/types/proposals';

// TODO : Need to do this properly
const getPI = () => 'THE PI NAME';

function mappingList(inRec: ProposalsBackend[]): Proposals[] {
  const output = [];
  for (let i = 0; i < inRec.length; i++) {
    const rec: Proposals = {
      id: inRec[i].prsl_id.toString(),
      category: inRec[i].proposal_info.proposal_type.main_type,
      title: inRec[i].proposal_info.title,
      cycle: inRec[i].proposal_info.cycle,
      pi: getPI(), // inRec[i].proposal_info.investigator),
      cpi: 'CPI',
      status: inRec[i].status,
      lastUpdated: new Date().toDateString(), // TODO : Needs to be the correct data
      telescope: 'N/A'
    };
    output.push(rec);
  }
  return output as Proposals[];
}

export function GetMockProposalList(): Proposals[] {
  return mappingList(MockProposals);
}

async function GetProposalList(): Promise<Proposals[] | string> {
  if (USE_LOCAL_DATA) {
    return GetMockProposalList();
  }

  try {
    const URL_PATH = `/proposals/list/DefaultUser`;
    const result = await axios.get(`${SKA_PHT_API_URL}${URL_PATH}`, AXIOS_CONFIG);
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : mappingList(result.data);
  } catch (e) {
    return e.message;
  }
}

export default GetProposalList;
