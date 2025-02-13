import { helpers } from '../../../utils/helpers';
import { PROJECTS, SKA_PHT_API_URL, USE_LOCAL_DATA } from '../../../utils/constants';
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

async function PostProposal(proposal: Proposal, status?: string) {
  if (USE_LOCAL_DATA) {
    return 'PROPOSAL-ID-001';
  }

  try {
    const URL_PATH = `/proposals`;

    const headers = new Headers({});
    headers.append('Content-Type', `application/json`);

    const options = {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(mappingPostProposal(proposal, status))
    };

    const response = await fetch(`${SKA_PHT_API_URL}${URL_PATH}`, options);
    console.log('TREVOR', response);
    const data = await response.json();
    return typeof response === 'undefined' ? 'error.API_UNKNOWN_ERROR' : data;
  } catch (e) {
    return e.message;
  }
}

export default PostProposal;
