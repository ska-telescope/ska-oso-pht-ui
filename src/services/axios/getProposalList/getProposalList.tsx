import axios from 'axios';
import { AXIOS_CONFIG, SKA_PHT_API_URL, USE_LOCAL_DATA } from '../../../utils/constants';
import MockProposals from './mockProposals';
import Proposals, { ProposalsBackend } from '../../../utils/types/proposals';

const getPI = (_inValue: any) => {
  const principalInvestigator = _inValue.proposal_info.investigators.find(p => p.principal_investigator === true);
  return `${principalInvestigator.first_name} ${principalInvestigator.last_name}`;
};

function mappingList(inRec: ProposalsBackend[]): Proposals[] {
  const output = [];
  for (let i = 0; i < inRec.length; i++) {
    const rec: Proposals = {
      id: inRec[i].prsl_id.toString(),
      category: inRec[i].proposal_info.proposal_type.main_type,
      title: inRec[i].proposal_info.title,
      cycle: inRec[i].proposal_info.cycle,
      pi: getPI(inRec[i]),
      cpi: 'CPI', // TODO -> is it co principal investigator?
      status: inRec[i].status,
      lastUpdated: new Date(inRec[i].metadata.last_modified_on).toDateString(),
      telescope: 'N/A' // TODO -> what to map to? telescopes in observations?
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
    console.log('GETPROPOSAL LIST', result.data);
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : mappingList(result.data);
  } catch (e) {
    return e.message;
  }
}

export default GetProposalList;
