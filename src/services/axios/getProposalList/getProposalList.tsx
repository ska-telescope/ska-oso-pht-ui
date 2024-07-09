import axios from 'axios';
import { AXIOS_CONFIG, SKA_PHT_API_URL, USE_LOCAL_DATA, Projects } from '../../../utils/constants';
import MockProposals from './mockProposals';
import Proposal, { ProposalBackend } from '../../../utils/types/proposal';
import { InvestigatorBackend } from '../../../utils/types/investigator';
import TeamMember from 'utils/types/teamMember';

const convertCategoryFormat = (_inValue: string): string => {
  const words = _inValue.split('_');
  const capitalizedWords = words.map(word => word.charAt(0).toUpperCase() + word.slice(1));
  const formattedString = capitalizedWords.join(' ');
  return formattedString;
};

const getSubCategory = (proposalType: { main_type: string; sub_type: string[] }): any => {
  const project = Projects.find(
    ({ title }) => title === convertCategoryFormat(proposalType.main_type)
  );
  const subTypesFormatted = [];
  for (let subtype of proposalType.sub_type) {
    subTypesFormatted.push(convertCategoryFormat(subtype));
  }
  const subProjects = subTypesFormatted.map(subType =>
    project.subProjects.find(({ title }) => title.toLowerCase() === subType.toLowerCase())
  );
  return subProjects.filter(({ id }) => id).map(({ id }) => id);
};

const getTeam = (investigators: InvestigatorBackend[]): TeamMember[] => {
  const teamMembers = [];
  for (let investigator of investigators) {
    const teamMember = {
      id: investigator.investigator_id,
      firstName: investigator.given_name,
      lastName: investigator.family_name,
      email: investigator.email,
      affiliation: investigator.organization,
      phdThesis: investigator.for_phd,
      status: 'unknown', // TODO check if we need to remove status for team member? not in backend anymore
      pi: investigator.principal_investigator
    };
    teamMembers.push(teamMember);
  }
  return teamMembers;
};

const getPI = (investigators: InvestigatorBackend[]): string => {
  const principalInvestigator = investigators.find(p => p.principal_investigator === true);
  return `${principalInvestigator.given_name} ${principalInvestigator.family_name}`;
};

function mappingList(inRec: ProposalBackend[]): Proposal[] {
  const output = [];
  for (let i = 0; i < inRec.length; i++) {
    const rec: Proposal = {
      id: inRec[i].prsl_id.toString(),
      proposalType: Projects.find(
        p =>
          p.title.toLowerCase() ===
          convertCategoryFormat(inRec[i].info.proposal_type.main_type).toLowerCase()
      ).id,
      proposalSubType: getSubCategory(inRec[i].info.proposal_type),
      title: inRec[i].info.title,
      cycle: inRec[i].cycle,
      team: getTeam(inRec[i].info.investigators),
      pi: getPI(inRec[i].info.investigators),
      status: inRec[i].status,
      lastUpdated: new Date(inRec[i].metadata.last_modified_on).toDateString()
      // telescope: 'N/A' // TODO is this still needed? -> what to map to? telescopes in observations?
    };
    output.push(rec);
  }
  console.log('output', output);
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
