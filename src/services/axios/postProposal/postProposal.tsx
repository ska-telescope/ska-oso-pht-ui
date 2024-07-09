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
// import MockProposalBackendNew2 from '../getProposal/mockProposalBackendNew2';

function mappingPostProposal(proposal, status) {
  const convertCategoryFormat = (_inValue: string): string => {
    const words = _inValue.split(' ');
    const lowerCaseWords = words.map(word => word.charAt(0).toLowerCase() + word.slice(1));
    const formattedString = lowerCaseWords.join('_');
    return formattedString;
  };

  const getSubCategory = (proposalType: number, proposalSubType: number[]): any => {
    const project = Projects.find(({ id }) => id === proposalType);
    const subTypes: string[] = [];
    for (let subtype of proposalSubType) {
      const sub = project.subProjects.find(item => item.id === subtype);
      if (sub) {
        const formattedSubType = convertCategoryFormat(sub.title);
        subTypes.push(formattedSubType);
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
        main_type: convertCategoryFormat(Projects.find(p => p.id === proposal.proposalType).title),
        sub_type: getSubCategory(proposal.proposalType, proposal.proposalSubType)
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
  if (USE_LOCAL_DATA) {
    return 'PROPOSAL-ID-001';
  }

  try {
    const URL_PATH = `/proposals`;
    // const convertedProposal = helpers.transform.convertProposalToBackendFormat(proposal, status);
    const convertedProposal = mappingPostProposal(proposal, status);
    // const proposalBackendFormat = MockProposalBackendNew2;

    const result = await axios.post(
      `${SKA_PHT_API_URL}${URL_PATH}`,
      /*proposalBackendFormat,*/ convertedProposal,
      AXIOS_CONFIG
    );
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : result.data;
  } catch (e) {
    return { error: e.message };
  }
}

export default PostProposal;
