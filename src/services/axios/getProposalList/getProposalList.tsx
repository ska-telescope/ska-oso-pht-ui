import axios from 'axios';
import TeamMember from 'utils/types/teamMember';
import Proposal, { ProposalBackend } from '../../../utils/types/proposal';
import MockProposalBackendList from './mockProposalBackendList';
import {
  AXIOS_CONFIG,
  SKA_PHT_API_URL,
  USE_LOCAL_DATA,
  PROJECTS,
  GENERAL
} from '@/utils/constants.ts';
import { InvestigatorBackend } from '@/utils/types/investigator.tsx';

/*********************************************************** filter *********************************************************/

const sortByLastUpdated = (array: ProposalBackend[]) => {
  array.sort(function(a, b) {
    return (
      new Date(b.metadata.last_modified_on).valueOf() -
      new Date(a.metadata.last_modified_on).valueOf()
    );
  });
};

const groupByProposalId = (data: ProposalBackend[]) => {
  return data.reduce((grouped, obj) => {
    if (!grouped[obj.prsl_id]) {
      grouped[obj.prsl_id] = [obj];
    } else {
      grouped[obj.prsl_id].push(obj);
    }
    return grouped;
  }, {});
};

const getMostRecentProposals = (data: ProposalBackend[]) => {
  let grouped: { [key: string]: ProposalBackend[] } = groupByProposalId(data);
  let sorted = (Object as any).values(grouped).map(arr => {
    sortByLastUpdated(arr);
    return arr;
  });
  const result = sorted.map(arr => arr[0]);
  return result;
};

/*****************************************************************************************************************************/
/*********************************************************** mapping *********************************************************/

const getSubType = (proposalType: { main_type: string; sub_type: string[] }): any => {
  const project = PROJECTS.find(({ mapping }) => mapping === proposalType.main_type);
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

function mappingList(inRec: ProposalBackend[]): Proposal[] {
  const output = [];
  for (let i = 0; i < inRec.length; i++) {
    const rec: Proposal = {
      id: inRec[i].prsl_id?.toString(),
      status: inRec[i].status,
      lastUpdated: inRec[i].metadata?.last_modified_on,
      lastUpdatedBy: inRec[i].metadata?.last_modified_by,
      createdOn: inRec[i].metadata?.created_on,
      createdBy: inRec[i].metadata?.created_by,
      version: inRec[i].metadata?.version,
      proposalType: PROJECTS.find(p => p.mapping === inRec[i].info?.proposal_type.main_type)?.id,
      proposalSubType: inRec[i].info?.proposal_type.sub_type
        ? getSubType(inRec[i].info?.proposal_type)
        : [],
      scienceCategory: inRec[i].info?.science_category
        ? getScienceCategory(inRec[i].info.science_category)
        : null,
      title: inRec[i].info?.title,
      cycle: inRec[i]?.cycle,
      team: inRec[i].info?.investigators ? getTeam(inRec[i].info.investigators) : []
    };
    output.push(rec);
  }
  return output as Proposal[];
}

/*****************************************************************************************************************************/

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
    const uniqueResults =
      result.data.length > 1 ? getMostRecentProposals(result.data) : result.data;
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : mappingList(uniqueResults);
  } catch (e) {
    return e.message;
  }
}

export default GetProposalList;
