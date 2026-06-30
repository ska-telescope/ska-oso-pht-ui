import { helpers } from '@utils/helpers.ts';
import {
  OSO_SERVICES_PROPOSAL_PATH,
  PROJECTS,
  SCIENCE_VERIFICATION,
  SKA_OSO_SERVICES_URL,
  USE_LOCAL_DATA
} from '@utils/constants.ts';
import Proposal, { ProposalBackend } from '@utils/types/proposal.tsx';
import useAxiosAuthClient from '../../axiosAuthClient/axiosAuthClient.tsx';
import { mapping } from '../../get/getProposal/getProposal.tsx';
import MappingPutProposal from '../../put/putProposal/putProposalMapping.tsx';
import { MockProposalBackend } from './mockProposalBackend.tsx';

export function mappingPostProposal(
  proposal: Proposal,
  status: string | undefined,
  isSV: boolean
): ProposalBackend {
  const getSubType = (proposalType: number, proposalSubType: number[]): any => {
    const project = PROJECTS.find(({ id }) => id === proposalType);
    const subTypes: string[] = [];
    for (let subtype of proposalSubType) {
      if (subtype) {
        subTypes.push(project?.subProjects?.find(item => item.id === subtype)?.mapping as any);
      }
    }
    return subTypes;
  };

  const transformedProposal: ProposalBackend = {
    prsl_id: proposal.id,
    status: status as string,
    submitted_by: '',
    submitted_on: null,
    investigator_refs: [],
    cycle: proposal.cycle,
    proposal_info: {
      title: proposal.title,
      proposal_type: {
        main_type: isSV
          ? SCIENCE_VERIFICATION
          : (PROJECTS.find(item => item.id === proposal.proposalType)?.mapping as string),
        attributes: proposal.proposalSubType
          ? getSubType(proposal.proposalType, proposal.proposalSubType)
          : []
      },
      abstract: '',
      science_category: '',
      investigators: []
    },
    observation_info: {
      targets: [],
      documents: [],
      observation_sets: [],
      data_product_sdps: [],
      data_product_src_nets: [],
      result_details: [],
      calibration_strategy: []
    }
  };
  // trim undefined properties
  helpers.transform.trimObject(transformedProposal);
  return transformedProposal;
}

export function mockPostProposal() {
  return mapping(MockProposalBackend);
}

async function PostProposal(
  authAxiosClient: ReturnType<typeof useAxiosAuthClient>,
  proposal: Proposal,
  isSV: boolean,
  status?: string
): Promise<Proposal | { error: string }> {
  if (USE_LOCAL_DATA) {
    return mockPostProposal();
  }

  try {
    const URL_PATH = `${OSO_SERVICES_PROPOSAL_PATH}/create`;
    // Use the full mapping so cloned proposals carry all content (targets, observations, etc.).
    // prsl_id is omitted — the backend generates a fresh SKUID on /create.
    // investigator_refs is omitted — the backend builds it from the investigators in proposal_info.
    // investigator status is stripped — it is proposal-scoped and should not be inherited by the clone.
    const { prsl_id: _omit, investigator_refs: _invRefs, ...mapped } = MappingPutProposal(proposal, isSV, status as string);
    const convertedProposal = {
      ...mapped,
      proposal_info: mapped.proposal_info
        ? {
            ...mapped.proposal_info,
            investigators: mapped.proposal_info.investigators?.map(
              ({ status: _s, ...inv }) => inv
            ) ?? []
          }
        : mapped.proposal_info
    };

    const result = await authAxiosClient.post(
      `${SKA_OSO_SERVICES_URL}${URL_PATH}`,
      convertedProposal
    );
    return !result || !result?.data ? { error: 'error.API_UNKNOWN_ERROR' } : mapping(result.data);
  } catch (e) {
    if (e instanceof Error) {
      return { error: e.message };
    }
    return { error: 'error.API_UNKNOWN_ERROR' };
  }
}

export default PostProposal;
