import axios from 'axios';
import {
  AXIOS_CONFIG,
  SKA_PHT_API_URL,
  USE_LOCAL_DATA,
  Projects,
  GENERAL
} from '../../../utils/constants';
import MockProposalBackendList from './mockProposalBackendList';
import Proposal, { ProposalBackend } from '../../../utils/types/proposal';
import { InvestigatorBackend } from '../../../utils/types/investigator';
import TeamMember from 'utils/types/teamMember';

const getSubType = (proposalType: { main_type: string; sub_type: string[] }): any => {
  const project = Projects.find(({ mapping }) => mapping === proposalType.main_type);
  const subProjects = proposalType.sub_type?.map(subType =>
    project.subProjects.find(({ mapping }) => mapping === subType)
  );
  return subProjects?.filter(({ id }) => id)?.map(({ id }) => id);
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

const getScienceCategory = (scienceCat: string) => {
  const cat = GENERAL.ScienceCategory.find(
    cat => cat.label?.toLowerCase() === scienceCat?.toLowerCase()
  )?.value;
  return cat ? cat : null;
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
      status: inRec[i].status,
      lastUpdated: new Date(inRec[i].metadata.last_modified_on).toDateString(),
      lastUpdatedBy: inRec[i].metadata.last_modified_by,
      createdOn: inRec[i].metadata.created_on,
      createdBy: inRec[i].metadata.created_by,
      version: inRec[i].metadata.version,
      proposalType: Projects.find(p => p.mapping === inRec[i].info.proposal_type.main_type)?.id,
      proposalSubType: inRec[i].info.proposal_type.sub_type
        ? getSubType(inRec[i].info.proposal_type)
        : [],
      scienceCategory: getScienceCategory(inRec[i].info.science_category),
      title: inRec[i].info.title,
      cycle: inRec[i].cycle,
      team: getTeam(inRec[i].info.investigators),
      pi: getPI(inRec[i].info.investigators)
      // telescope: 'N/A' // TODO is this still needed? -> what to map to? telescopes in observations?
    };
    output.push(rec);
  }
  return output as Proposal[];
}

export function GetMockProposalList(): Proposal[] {
  return mappingList(MockProposalBackendList);
}

async function GetProposalList(): Promise<Proposal[] | string> {
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
