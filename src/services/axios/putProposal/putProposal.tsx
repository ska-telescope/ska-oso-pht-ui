import axios from 'axios';
import {
  AXIOS_CONFIG,
  DEFAULT_PI,
  GENERAL,
  Projects,
  SKA_PHT_API_URL,
  USE_LOCAL_DATA
} from '../../../utils/constants';
import Proposal, { ProposalBackend } from '../../../utils/types/proposal';

/*
TODO:
- test putProposal mapping with data and map all new properties
- tidy up and remove all old mapping functions in this file
*/

function mappingPutProposal(proposal: Proposal, status: string) {
  // TODO: add groupObservations to send to backend

  /*
  const targetObservationsByObservation = proposal.targetObservation?.reduce((acc, to) => {
    if (!acc[to.observationId]) {
      acc[to.observationId] = [];
    }
    acc[to.observationId].push(to.targetId.toString());
    return acc;
  }, {});

  const scienceProgrammes = proposal.observations?.map(observation => {
    const targetIds = targetObservationsByObservation[observation.id] || [];
    const targets = proposal?.targets?.filter(target =>
      targetIds.includes(target.id.toString())
    );
    const array = OBSERVATION.array.find(p => p.value === observation.telescope);
    return {
      array: array?.label,
      subarray: array?.subarray?.find(sa => sa.value === observation.subarray)?.label,
      linked_sources: targets?.map(target => target.name),
      observation_type: OBSERVATION_TYPE_BACKEND[observation.type]
    };
  });
  */

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

  // TODO : complete mapping for all properties
  const transformedProposal: ProposalBackend = {
    /*
      science_category: GENERAL.ScienceCategory?.find(
        category => category.value === proposal?.category
      )?.label,
      */
    prsl_id: proposal?.id?.toString(),
    status: status,
    submitted_on: '', // TODO
    submitted_by: '', // TODO
    investigator_refs: [DEFAULT_PI.id],
    metadata: {
      version: proposal.version++,
      created_by: proposal.createdBy,
      created_on: proposal.createdOn,
      last_modified_by: `${DEFAULT_PI.firstName} ${DEFAULT_PI.lastName}`,
      last_modified_on: new Date().toDateString()
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
      observation_sets: [], // TODO add a conversion function to change units to 'm/s' when mapping so we don't have a 'm / s' format in front-end
      data_product_sdps: [],
      data_product_src_nets: [],
      results: []

      /*
      targets: proposal?.targets?.map(target => ({
        name: target?.name,
        right_ascension: target?.ra,
        declination: target?.dec,
        velocity: parseFloat(target?.vel),
        velocity_unit: '', // TODO: confirm what units should be expected
        right_ascension_unit: '', // TODO: confirm what units should be expected
        declination_unit: '' // TODO: confirm what units should be expected
      })),
      */
      /*
      investigators: proposal.team?.map(teamMember => ({
      science_programmes: scienceProgrammes
      */
    }
  };
  // trim undefined properties
  this.trimObject(transformedProposal);
  return transformedProposal;
}

async function PutProposal(proposal, status?) {
  if (USE_LOCAL_DATA) {
    return 'success';
  }

  try {
    const URL_PATH = `/proposals/${proposal.id}`;
    // TODO: add testing for proposal conversion format
    const convertedProposal = mappingPutProposal(proposal, status);
    const result = await axios.put(
      `${SKA_PHT_API_URL}${URL_PATH}`,
      convertedProposal,
      AXIOS_CONFIG
    );
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : result.data;
  } catch (e) {
    return { error: e.message };
  }
}

export default PutProposal;
