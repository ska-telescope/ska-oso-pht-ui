import axios from 'axios';
import { helpers } from '../../../utils/helpers';
import { AXIOS_CONFIG, PROJECTS, SKA_PHT_API_URL, USE_LOCAL_DATA } from '../../../utils/constants';
import Proposal, { ProposalBackend } from '../../../utils/types/proposal';
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
        sub_type: proposal.proposalSubType
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
      results: []
    }
  };
  // trim undefined properties
  helpers.transform.trimObject(transformedProposal);
  return transformedProposal;
}

async function PostProposal(proposal: Proposal, status?: string) {
  if (USE_LOCAL_DATA) {
    return 'PROPOSAL-ID-001';
  }

  try {
    const URL_PATH = `/prsls/create`;
    const convertedProposal = mappingPostProposal(proposal, status);

    const result = await axios.post(
      `${SKA_PHT_API_URL}${URL_PATH}`,
      convertedProposal,
      AXIOS_CONFIG
    );
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : result.data;
  } catch (e) {
    return { error: e.message };
  }
}

export default PostProposal;
