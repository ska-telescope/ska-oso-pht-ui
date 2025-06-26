import axios from 'axios';
import TeamMember from '../../../utils/types/teamMember';
import Proposal, { ProposalBackend } from '../../../utils/types/proposal';
import {
  AXIOS_CONFIG,
  SKA_OSO_SERVICES_URL,
  USE_LOCAL_DATA,
  PROJECTS,
  GENERAL,
  OSO_SERVICES_PROPOSAL_PATH
} from '../../../utils/constants';
import { InvestigatorBackend } from '../../../utils/types/investigator';
import MockProposalBackendList from './mockProposalBackendList';

/*********************************************************** filter *********************************************************/

export const sortByLastUpdated = (array: ProposalBackend[]): ProposalBackend[] => {
  array.sort(function(a, b) {
    return (
      new Date(b.metadata?.last_modified_on as string)?.valueOf() -
      new Date(a.metadata?.last_modified_on as string)?.valueOf()
    );
  });
  return array;
};

// const groupByProposalId = (data: ProposalBackend[]) => {
//   return data.reduce((grouped, obj) => {
//     if (!grouped[obj.prsl_id]) {
//       grouped[obj.prsl_id] = [obj];
//     } else {
//       grouped[obj.prsl_id].push(obj);
//     }
//     return grouped;
//   }, {});
// };

const groupByProposalId = (data: ProposalBackend[]) => {
  return data.reduce((grouped: { [key: string]: ProposalBackend[] }, obj) => {
    if (!grouped[obj.prsl_id]) {
      grouped[obj.prsl_id] = [obj];
    } else {
      grouped[obj.prsl_id].push(obj);
    }
    return grouped;
  }, {} as { [key: string]: ProposalBackend[] });
};

const getMostRecentProposals = (data: ProposalBackend[]) => {
  let grouped: { [key: string]: ProposalBackend[] } = groupByProposalId(data);
  let sorted = (Object as any).values(grouped).map((arr: ProposalBackend[]) => {
    sortByLastUpdated(arr);
    return arr;
  });
  const result = sorted.map((arr: ProposalBackend[]) => arr[0]);
  return result;
};

/*****************************************************************************************************************************/
/*********************************************************** mapping *********************************************************/

const getSubType = (proposalType: {
  main_type: string | undefined;
  attributes?: string[] | undefined;
}): any => {
  const project = PROJECTS.find(({ mapping }) => mapping === proposalType.main_type);
  const subProjects = proposalType.attributes?.map(subType =>
    project?.subProjects?.find(({ mapping }) => mapping === subType)
  ) as { id: number; mapping: string }[];
  return subProjects?.filter(({ id }) => id)?.map(({ id }) => id);
};

const getTeam = (investigators: InvestigatorBackend[] | undefined): TeamMember[] => {
  const teamMembers: TeamMember[] = [];
  if (!investigators) {
    return teamMembers as TeamMember[];
  }
  for (let investigator of investigators) {
    const teamMember = {
      id: investigator.investigator_id,
      firstName: investigator.given_name,
      lastName: investigator.family_name,
      email: investigator.email,
      affiliation: investigator.organization as string,
      phdThesis: investigator.for_phd as boolean,
      status: 'unknown', // TODO check if we need to remove status for team member? not in backend anymore
      pi: investigator.principal_investigator as boolean
    };
    teamMembers.push(teamMember);
  }
  return teamMembers as TeamMember[];
};

const getScienceCategory = (scienceCat: string) => {
  const cat = GENERAL.ScienceCategory.find(
    cat => cat.label?.toLowerCase() === scienceCat?.toLowerCase()
  )?.value;
  return cat ? cat : null;
};

export function mappingList(inRec: ProposalBackend[]): Proposal[] {
  const output = [];
  for (let i = 0; i < inRec.length; i++) {
    const rec: Proposal = {
      id: inRec[i].prsl_id?.toString(),
      status: inRec[i].status,
      lastUpdated: inRec[i].metadata?.last_modified_on as string,
      lastUpdatedBy: inRec[i].metadata?.last_modified_by as string,
      createdOn: inRec[i].metadata?.created_on as string,
      createdBy: inRec[i].metadata?.created_by as string,
      version: inRec[i].metadata?.version as number,
      proposalType: PROJECTS.find(p => p.mapping === inRec[i].info?.proposal_type.main_type)
        ?.id as number,
      proposalSubType: inRec[i].info?.proposal_type?.attributes
        ? getSubType(inRec[i].info?.proposal_type)
        : [],
      scienceCategory: inRec[i].info?.science_category
        ? (getScienceCategory(inRec[i].info.science_category) as number)
        : ((null as unknown) as number),
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
    const URL_PATH = `${OSO_SERVICES_PROPOSAL_PATH}/list/DefaultUser`;
    const result = await axios.get(`${SKA_OSO_SERVICES_URL}${URL_PATH}`, AXIOS_CONFIG);

    if (!result || !Array.isArray(result.data)) {
      return 'error.API_UNKNOWN_ERROR';
    }

    const uniqueResults =
      result.data.length > 1 ? getMostRecentProposals(result.data) : result.data;
    return mappingList(uniqueResults);
  } catch (e) {
    if (e instanceof Error) {
      return e.message;
    }
    return 'error.API_UNKNOWN_ERROR';
  }
}

export default GetProposalList;
