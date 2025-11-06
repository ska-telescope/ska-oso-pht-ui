import MockProposal from '@services/axios/get/getProposalList/mockProposal.tsx';
import useAxiosAuthClient from '../../axiosAuthClient/axiosAuthClient';
import MockProposalBackendList from './mockProposalBackendList';
import Proposal, { ProposalBackend } from '@/utils/types/proposal';
import {
  SKA_OSO_SERVICES_URL,
  USE_LOCAL_DATA,
  PROJECTS,
  GENERAL,
  OSO_SERVICES_PROPOSAL_PATH,
  isCypress,
  SCIENCE_VERIFICATION
} from '@/utils/constants';
import Investigator, { InvestigatorBackend } from '@/utils/types/investigator';
import { getUniqueMostRecentItems } from '@/utils/helpers';

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

const getInvestigators = (inc: InvestigatorBackend[] | null): Investigator[] => {
  const investigators: Investigator[] = [];
  if (!inc) {
    return [];
  }
  for (let item of inc) {
    const investigator = {
      id: item.user_id,
      firstName: item.given_name,
      lastName: item.family_name,
      email: item.email,
      affiliation: item.organization as string,
      phdThesis: item.for_phd as boolean,
      status: 'unknown',
      pi: item.principal_investigator as boolean,
      officeLocation: item.officeLocation as string | null,
      jobTitle: item.jobTitle as string | null
    };
    investigators.push(investigator);
  }
  return investigators as Investigator[];
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
    const tmp = inRec[i];
    const rec: Proposal = {
      id: tmp.prsl_id?.toString(),
      status: tmp.status,
      lastUpdated: tmp.metadata?.last_modified_on as string,
      lastUpdatedBy: tmp.metadata?.last_modified_by as string,
      createdOn: tmp.metadata?.created_on as string,
      createdBy: tmp.metadata?.created_by as string,
      version: tmp.metadata?.version as number,
      proposalType: PROJECTS.find(p => p.mapping === tmp.proposal_info?.proposal_type.main_type)
        ?.id as number,
      proposalSubType:
        tmp.proposal_info?.proposal_type.main_type !== SCIENCE_VERIFICATION &&
        tmp.proposal_info?.proposal_type?.attributes
          ? getSubType(tmp.proposal_info?.proposal_type)
          : [],
      scienceCategory: tmp.proposal_info?.science_category
        ? (getScienceCategory(
            tmp?.proposal_info?.science_category !== null ? tmp.proposal_info.science_category : ''
          ) as number)
        : ((null as unknown) as number),
      title: tmp.proposal_info?.title,
      cycle: tmp?.cycle,
      investigators: tmp.proposal_info?.investigators
        ? getInvestigators(tmp.proposal_info.investigators)
        : [],
      abstract: tmp.proposal_info?.abstract ?? undefined,
      sciencePDF: null,
      technicalPDF: null,
      calibrationStrategy: [] // not needed for proposal list
    };
    output.push(rec);
  }
  return output as Proposal[];
}

/*****************************************************************************************************************************/

export function GetMockProposalList(): Proposal[] {
  return mappingList(MockProposalBackendList);
}

async function GetProposalList(
  authAxiosClient: ReturnType<typeof useAxiosAuthClient>
): Promise<Proposal[] | string> {
  if (USE_LOCAL_DATA) {
    return GetMockProposalList();
  }
  if (isCypress) {
    return mappingList(MockProposal);
  }

  try {
    const URL_PATH = `${OSO_SERVICES_PROPOSAL_PATH}/mine`;
    const result = await authAxiosClient.get(`${SKA_OSO_SERVICES_URL}${URL_PATH}`);

    if (!result || !Array.isArray(result.data)) {
      return 'error.API_UNKNOWN_ERROR';
    }

    const uniqueResults: ProposalBackend[] =
      result.data.length > 1 ? getUniqueMostRecentItems(result.data, 'prsl_id') : result.data;
    return mappingList(uniqueResults);
  } catch (e) {
    if (e instanceof Error) {
      return e.message;
    }
    return 'error.API_UNKNOWN_ERROR';
  }
}

export default GetProposalList;
