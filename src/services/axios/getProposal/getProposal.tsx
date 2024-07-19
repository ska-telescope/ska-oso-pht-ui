/*
TODO:
- test getProposal mapping with data and map all new properties
- check if there are new properties to include in the frontend types?
- tidy up and remove all old mapping functions in this file
*/

import axios from 'axios';
import {
  AXIOS_CONFIG,
  Projects,
  SKA_PHT_API_URL,
  TEAM_STATUS_TYPE_OPTIONS,
  USE_LOCAL_DATA
} from '../../../utils/constants';
import MockProposalBackend from './mockProposalBackend';
import Proposal, { ProposalBackend } from '../../../utils/types/proposal';
import { InvestigatorBackend } from 'utils/types/investigator';

const getTeamMembers = (inValue: InvestigatorBackend[]) => {
  let results = [];
  for (let i = 0; i < inValue.length; i++) {
    results.push({
      id: i + 1,
      firstName: inValue[i].given_name,
      lastName: inValue[i].family_name,
      email: inValue[i]?.email,
      affiliation: inValue[i].organization,
      phdThesis: inValue[i].for_phd,
      status: TEAM_STATUS_TYPE_OPTIONS.accepted,
      pi: inValue[i].principal_investigator
    });
  }
  return results;
};

/*
const getCategory = (cat: String) => {
  const rec = GENERAL.ScienceCategory.find(p => p.label === cat);
  return rec ? rec.value : 0;
};
*/

/*
const getSubCategory = () => {
  return 1;
};
*/

/*
const getTargets = (inValue: TargetBackend[]) => {
  let results = [];
  for (let i = 0; i < inValue.length; i++) {
    const e = inValue[i];
    results.push({
      dec: e.reference_coordinate.dec?.toString(),
      decUnits: e.reference_coordinate.unit,
      id: e.target_id !== '' ? e.target_id : i + 1,
      name: e.reference_coordinate.kind, // TODO: check this is correct
      ra: e.reference_coordinate.ra?.toString(),
      raUnits: e.reference_coordinate.unit,
      referenceFrame: e.reference_coordinate.reference_frame,
      vel: e.radial_velocity.quantity.value?.toString(),
      velUnits: e.radial_velocity.quantity.unit
    });
  }
  return results;
};
*/

/*
const getIntegrationTimeUnits = (inValue: String) => {
  const unitsList = OBSERVATION.Supplied.find(s => s.label === 'Integration Time')?.units;
  return unitsList.find(u => u.label === inValue)?.value;
};
*/

/*
const getObservations = (inValue: ObservationSetBackend[]) => {
  let results = [];
  for (let i = 0; i < inValue.length; i++) {
    const arr = inValue[i].array_details[i].array === 'MID' ? 1 : 2;
    const sub = OBSERVATION.array[arr - 1].subarray.find(
      p => p.label === inValue[i].array_details[i].subarray
    );
    results.push({
      id: inValue[i].observation_set_id,
      telescope: arr,
      subarray: sub ? sub.value : 0,
      type:
        inValue[i].observation_type_details?.observation_type === OBSERVATION_TYPE_BACKEND[0]
          ? 0
          : 1,
      imageWeighting: inValue[i].observation_type_details?.image_weighting,
      observingBand: inValue[i].observing_band,
      // integrationTime: inValue[i].integration_time, // coming from sens calc results?
      // integrationTimeUnits: getIntegrationTimeUnits(inValue[i].integration_time_units), // coming from sens calc results?
      centralFrequency: inValue[i].observation_type_details?.central_frequency
    });
  }
  return results;
};
*/

/*
const getGroupObservations = (inValue: ObservationSetBackend[]) => {
  let results = [];
  for (let i = 0; i < inValue.length; i++) {
    if (inValue[i].group_id) {
      const observationSetId = inValue[i].observation_set_id;
      const observationId =
        observationSetId && observationSetId.trim() !== '' ? observationSetId : i + 1;
      results.push({
        observationId: observationId,
        groupId: inValue[i].group_id
      });
    }
  }
  return results;
};
*/

/* // old mapping - keeping it here for a bit during the transition
function mapping(inRec: ProposalBackend): Proposal {
  return {
    id: inRec.prsl_id,
    title: inRec.proposal_info.title,
    proposalType: getProposalType(inRec.proposal_info.proposal_type),
    proposalSubType: [getProposalSubTypeType(inRec.proposal_info.proposal_type)],
    team: getTeamMembers(inRec.proposal_info.investigators),
    abstract: inRec.proposal_info.abstract,
    category: getCategory(inRec.proposal_info.science_category),
    subCategory: [getSubCategory()],
    sciencePDF: null,
    scienceLoadStatus: 0,
    targetOption: 1,
    targets: getTargets(inRec.proposal_info.targets),
    observations: getObservations(inRec.proposal_info.science_programmes),
    groupObservations: getGroupObservations(inRec.proposal_info.science_programmes),
    targetObservation: [],
    technicalPDF: null,
    technicalLoadStatus: 0,
    dataProducts: [],
    pipeline: ''
  };
}
*/

const convertTypeFormat = (_inValue: string): string => {
  const words = _inValue.split('_');
  const capitalizedWords = words.map(word => word.charAt(0).toUpperCase() + word.slice(1));
  const formattedString = capitalizedWords.join(' ');
  return formattedString;
};

const getSubType = (proposalType: { main_type: string; sub_type: string[] }): any => {
  const project = Projects.find(({ mapping }) => mapping === proposalType.main_type);
  const subProjects = proposalType.sub_type?.map(subType =>
    project.subProjects.find(({ mapping }) => mapping === subType)
  );
  return subProjects?.filter(({ id }) => id)?.map(({ id }) => id);
};

function mapping(inRec: ProposalBackend): Proposal {
  // TODO: finish mapping and add new fields if needed
  const convertedProposal = {
    id: inRec.prsl_id, // TODO
    title: inRec.info.title, // TODO
    proposalType: Projects.find( p =>p.mapping === inRec.info.proposal_type.main_type )?.id,
    proposalSubType: inRec.info.proposal_type.sub_type ? getSubType(inRec.info.proposal_type) : [],
    status: inRec.status,
    lastUpdated: new Date(inRec.metadata.last_modified_on).toDateString(),
    lastUpdatedBy: inRec.metadata.last_modified_by,
    createdOn: inRec.metadata.created_on,
    createdBy: inRec.metadata.created_by,
    version: inRec.metadata.version,
    cycle: '', // TODO
    team: getTeamMembers(inRec.info.investigators),
    pi: 'PI-Ref', // TODO
    abstract: inRec.info.abstract, // TODO
    category: inRec.info.science_category,
    subCategory: [1], // TODO // [getSubCategory()],
    sciencePDF: null, // TODO: map to DocumentBackend?
    scienceLoadStatus: 0, //TODO
    targetOption: 1, // TODO
    targets: [], // TODO getTargets(inRec.info.targets),
    observations: [], // TODO // getObservations(inRec.info.observation_sets),
    groupObservations: [], // TODO // getGroupObservations(inRec.info.observation_sets),
    targetObservation: [], // TODO
    technicalPDF: null, // TODO: map to DocumentBackend?
    technicalLoadStatus: 0, // TODO
    dataProducts: [], // TODO: map to data_product_sdps and data_product_src_nets?
    pipeline: ''
  };
  return convertedProposal;
}

export function GetMockProposal(): Proposal {
  return mapping(MockProposalBackend);
}

async function GetProposal(id: string): Promise<Proposal | string> {
  if (USE_LOCAL_DATA) {
    return GetMockProposal();
  }

  try {
    const URL_PATH = `/proposals/${id}`;
    const result = await axios.get(`${SKA_PHT_API_URL}${URL_PATH}`, AXIOS_CONFIG);
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : mapping(result.data);
  } catch (e) {
    return e.message;
  }
}

export default GetProposal;
