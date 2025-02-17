import { SKA_PHT_API_URL, USE_LOCAL_DATA, PROJECTS, GENERAL } from '../../../utils/constants';
import MockProposalBackendList from './mockProposalBackendList';
import Proposal, { ProposalBackend } from '../../../utils/types/proposal';
import { InvestigatorBackend } from '../../../utils/types/investigator';
import TeamMember from 'utils/types/teamMember';

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

const getSubType = (proposalType: { main_type: string; attributes?: string[] }): any => {
  const project = PROJECTS.find(({ mapping }) => mapping === proposalType.main_type);
  const subProjects = proposalType.attributes?.map(subType =>
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
      proposalSubType: inRec[i].info?.proposal_type.attributes
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
    //
    const headers = new Headers({});
    headers.append('Content-Type', `application/json`);
    //
    const options: RequestInit = {};
    options.method = 'GET';
    options.headers = headers;
    //
    const response = await fetch(`${SKA_PHT_API_URL}${URL_PATH}`, options);
    const data = await response.json();
    const uniqueResults = data.length > 1 ? getMostRecentProposals(data) : data;
    return typeof response === 'undefined' ? 'error.API_UNKNOWN_ERROR' : mappingList(uniqueResults);
  } catch (e) {
    return e.message;
  }
}

export default GetProposalList;
