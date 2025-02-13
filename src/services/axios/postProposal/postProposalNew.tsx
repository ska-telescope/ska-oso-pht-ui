import useAxiosAuthClient from '../axiosAuthClient/axiosAuthClient';
import { AxiosResponse } from 'axios';
import { helpers } from '../../../utils/helpers';
import Proposal, { ProposalBackend } from '../../../utils/types/proposal';
import { PROJECTS, USE_LOCAL_DATA } from '../../../utils/constants';
import { fetchCycleData } from '../../../utils/storage/cycleData';

function mappingPostProposal(proposal: Proposal, status: string): ProposalBackend {
  const getSubType = (proposalType: number, proposalSubType: number[]): any => {
    const project = PROJECTS.find(({ id }) => id === proposalType);
    const subTypes: string[] = [];
    for (let subtype of proposalSubType) {
      if (subtype) {
        subTypes.push(project.subProjects.find(item => item.id === subtype)?.mapping);
      }
    }
    return subTypes;
  };

  const transformedProposal: ProposalBackend = {
    prsl_id: proposal?.id?.toString(),
    status: status,
    submitted_on: '',
    submitted_by: '',
    investigator_refs: [],
    cycle: fetchCycleData().id,
    info: {
      title: proposal.title,
      proposal_type: {
        main_type: PROJECTS.find(item => item.id === proposal.proposalType)?.mapping,
        attributes: proposal.proposalSubType
          ? getSubType(proposal.proposalType, proposal.proposalSubType)
          : []
      },
      abstract: '',
      science_category: '',
      targets: [],
      documents: [],
      investigators: [],
      observation_sets: [],
      data_product_sdps: [],
      data_product_src_nets: [],
      result_details: []
    }
  };
  // trim undefined properties
  helpers.transform.trimObject(transformedProposal);
  return transformedProposal;
}

const PostProposal = async (
  axiosClient: ReturnType<typeof useAxiosAuthClient>, // Add the authAxiosClient parameter
  proposal: Proposal,
  status?: string
): Promise<AxiosResponse> => {
  if (USE_LOCAL_DATA) {
    return { config: null, data: 'PROPOSAL-ID-001', headers: null, status: 200, statusText: 'OK' };
  }

  try {
    const URL_PATH = `/proposals`;
    const convertedProposal = mappingPostProposal(proposal, status);

    const response = await axiosClient.post(URL_PATH, convertedProposal);
    return response;
  } catch (error) {
    console.error('Error posting a proposal:', error);

    if (error.response) {
      // Server error
      throw error.response; // Re-throw the AxiosResponse error for the caller to handle
    } else if (error.request) {
      // Request error (no response)
      throw new Error('No response received from the server'); // Re-throw a custom error
    } else {
      // Client-side error
      throw error; // Re-throw the original error
    }
  }
};

export default PostProposal;
