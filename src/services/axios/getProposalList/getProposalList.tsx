import axios from 'axios';
import { AXIOS_CONFIG, SKA_PHT_API_URL, USE_LOCAL_DATA, Projects } from '../../../utils/constants';
import MockProposals from './mockProposals';
import Proposal, { ProposalBackend } from '../../../utils/types/proposal';

const getPI = (_inValue: any) => {
  const principalInvestigator = _inValue.info.investigators.find(p => p.principal_investigator === true);
  return `${principalInvestigator.given_name} ${principalInvestigator.family_name}`;
};

function mappingList(inRec: ProposalBackend[]): Proposal[] {
  const output = [];
  for (let i = 0; i < inRec.length; i++) {
    const rec: Proposal = {
      id: inRec[i].prsl_id.toString(),
      // category: Projects.find(p => p.title === inRec[i].info.proposal_type.main_type).id
      category: Projects.find(p => p.title === 'Standard Proposal').id, // TODO use proposal main_type once correct proposal can be created
      title: inRec[i].info.title,
      cycle: inRec[i].cycle,
      pi: getPI(inRec[i]),
      cpi: 'CPI', // TODO -> is it co principal investigator?
      status: inRec[i].status,
      lastUpdated: new Date(inRec[i].metadata.last_modified_on).toDateString(),
      telescope: 'N/A' // TODO -> what to map to? telescopes in observations?
    };
    output.push(rec);
  }
  return output as Proposal[];
}

export function GetMockProposalList(): Proposal[] {
  return mappingList(MockProposals);
}

async function GetProposalList(): Promise<Proposal[] | string> {
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
