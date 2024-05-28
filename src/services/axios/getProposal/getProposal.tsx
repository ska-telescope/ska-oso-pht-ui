import axios from 'axios';
import {
  AXIOS_CONFIG,
  GENERAL,
  OBSERVATION,
  OBSERVATION_TYPE_BACKEND,
  Projects,
  SKA_PHT_API_URL,
  TEAM_STATUS_TYPE_OPTIONS,
  USE_LOCAL_DATA
} from '../../../utils/constants';
import MockProposal from './mockProposal';
import Proposal, { ProposalBackend } from '../../../utils/types/proposal';
import { TargetBackend } from 'utils/types/target';
import { ObservationSetBackend } from 'utils/types/observationSet';
import { InvestigatorBackend } from 'utils/types/investigator';

const getProposalType = (inValue: { main_type: string; sub_type: string[] }) => {
  const rec = Projects.find(p => p.title === inValue.main_type);
  return rec.id;
};

/*
// old getProposalSubTypeType
const getProposalSubTypeType = (inValue: { main_type: string; sub_type: string }) => {
  const rec = Projects.find(p => p.title === inValue.main_type);
  const rec2 = rec.subProjects.find(p => p.title === inValue.sub_type);
  return rec2 ? rec2.id : null;
};
*/

const getProposalSubTypeType = (inValue: { main_type: string; sub_type: string[] }) => {
  const project = Projects.find(({ title }) => title === inValue.main_type);
  const subProjects = inValue.sub_type.map(subType =>
    project.subProjects.find(({ title }) => title === subType)
  );
  return subProjects.filter(({ id }) => id).map(({ id }) => id);
};

/*
// old getTeamMembers
const getTeamMembers = (inValue: TeamMemberBackend[]) => {
  let results = [];
  for (let i = 0; i < inValue.length; i++) {
    results.push({
      id: i + 1,
      firstName: inValue[i].first_name,
      lastName: inValue[i].last_name,
      email: inValue[i].email,
      country: inValue[i].country,
      affiliation: inValue[i].organization,
      phdThesis: inValue[i].for_phd,
      status: TEAM_STATUS_TYPE_OPTIONS.accepted,
      pi: inValue[i].principal_investigator
    });
  }
  return results;
};
*/

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

const getCategory = (cat: String) => {
  const rec = GENERAL.ScienceCategory.find(p => p.label === cat);
  return rec ? rec.value : 0;
};

const getSubCategory = () => {
  return 1;
};

/*
// old getTargets
const getTargets = (inValue: TargetBackend[]) => {
  let results = [];
  for (let i = 0; i < inValue.length; i++) {
    const e = inValue[i];
    results.push({
      dec: e.declination?.toString(),
      decUnits: e.declination_unit,
      id: i + 1,
      name: e.name,
      ra: e.right_ascension?.toString(),
      raUnits: e.right_ascension_unit,
      referenceFrame: '',
      vel: e.velocity?.toString(),
      velUnits: e.velocity_unit
    });
  }
  return results;
};
*/

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

/*
const getIntegrationTimeUnits = (inValue: String) => {
  const unitsList = OBSERVATION.Supplied.find(s => s.label === 'Integration Time')?.units;
  return unitsList.find(u => u.label === inValue)?.value;
};
*/

/*
// old getObservations
const getObservations = (inValue: ScienceProgrammeBackend[]) => {
  let results = [];
  for (let i = 0; i < inValue.length; i++) {
    const arr = inValue[i].array === 'MID' ? 1 : 2;
    const sub = OBSERVATION.array[arr - 1].subarray.find(p => p.label === inValue[i].subarray);
    results.push({
      id: i + 1,
      telescope: arr,
      subarray: sub ? sub.value : 0,
      type: inValue[i].observation_type === OBSERVATION_TYPE_BACKEND[0] ? 0 : 1,
      imageWeighting: inValue[i].image_weighting,
      observingBand: inValue[i].observing_band,
      integrationTime: inValue[i].integration_time,
      integrationTimeUnits: getIntegrationTimeUnits(inValue[i].integration_time_units),
      centralFrequency: inValue[i].central_frequency
    });
  }
  return results;
};
*/

const getObservations = (inValue: ObservationSetBackend[]) => {
  let results = [];
  for (let i = 0; i < inValue.length; i++) {
    const arr = inValue[i].array_details.array === 'MID' ? 1 : 2;
    const sub = OBSERVATION.array[arr - 1].subarray.find(
      p => p.label === inValue[i].array_details.subarray
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

/*
// old getGroupObservations
const getGroupObservations = (inValue: ScienceProgrammeBackend[]) => {
  let results = [];
  for (let i = 0; i < inValue.length; i++) {
    if (inValue[i].groupId) {
      results.push({
        observationId: i + 1,
        groupId: inValue[i].groupId
      });
    }
  }
  return results;
};
*/

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

function mapping(inRec: ProposalBackend): Proposal {
  return {
    id: inRec.prsl_id,
    title: inRec.info.title,
    proposalType: getProposalType(inRec.info.proposal_type),
    proposalSubType: getProposalSubTypeType(inRec.info.proposal_type),
    team: getTeamMembers(inRec.info.investigators),
    abstract: inRec.info.abstract,
    category: getCategory(inRec.info.science_category),
    subCategory: [getSubCategory()],
    sciencePDF: null,
    scienceLoadStatus: 0,
    targetOption: 1,
    targets: getTargets(inRec.info.targets), // TODO
    observations: getObservations(inRec.info.observation_sets),
    groupObservations: getGroupObservations(inRec.info.observation_sets),
    targetObservation: [],
    technicalPDF: null,
    technicalLoadStatus: 0,
    dataProducts: [],
    pipeline: ''
  };
}

export function GetMockProposal(): Proposal {
  return mapping(MockProposal);
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
