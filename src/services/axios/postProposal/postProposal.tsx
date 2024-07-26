import axios from 'axios';
import { helpers } from '../../../utils/helpers';
import {
  AXIOS_CONFIG,
  DEFAULT_PI,
  GENERAL,
  Projects,
  SKA_PHT_API_URL,
  USE_LOCAL_DATA
} from '../../../utils/constants';
import Proposal, { ProposalBackend } from '../../../utils/types/proposal';

function mappingPostProposal(proposal: Proposal, status: string): ProposalBackend {
  const getSubType = (proposalType: number, proposalSubType: number[]): any => {
    const project = Projects.find(({ id }) => id === proposalType);
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
    investigator_refs: [DEFAULT_PI.id],
    metadata: {
      version: 1,
      created_by: `${DEFAULT_PI.firstName} ${DEFAULT_PI.lastName}`,
      created_on: new Date().toDateString(),
      last_modified_by: '',
      last_modified_on: ''
    },
    cycle: GENERAL.Cycle,
    info: {
      title: proposal.title,
      proposal_type: {
        main_type: Projects.find(item => item.id === proposal.proposalType)?.mapping,
        sub_type: proposal.proposalSubType
          ? getSubType(proposal.proposalType, proposal.proposalSubType)
          : []
      },
      abstract: '',
      science_category: '',
      targets: [],
      documents: [],
      investigators: [
        {
          investigator_id: DEFAULT_PI.id,
          given_name: DEFAULT_PI.firstName,
          family_name: DEFAULT_PI.lastName,
          email: DEFAULT_PI.email,
          organization: DEFAULT_PI.affiliation,
          for_phd: DEFAULT_PI.phdThesis,
          principal_investigator: DEFAULT_PI.pi
        }
      ],
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
  if (window.Cypress || USE_LOCAL_DATA) {
    return 'PROPOSAL-ID-001';
  }

  try {
    const URL_PATH = `/proposals`;
    const convertedProposal = mappingPostProposal(proposal, status);
    console.log('POST converted proposal', convertedProposal);

    const result = await axios.post(
      `${SKA_PHT_API_URL}${URL_PATH}`,
      convertedProposal,
      AXIOS_CONFIG
    );
    console.log('POST incomming proposal', result.data);
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : result.data;
  } catch (e) {
    return { error: e.message };
  }
}

export default PostProposal;
