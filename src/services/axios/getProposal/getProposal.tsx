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
import { ScienceProgrammeBackend } from 'utils/types/scienceProgrammes';
import { TeamMemberBackend } from '../../../utils/types/teamMember';
import { TargetBackend } from 'utils/types/target';

const getProposalType = (inValue: { main_type: string; sub_type: string }) => {
  const rec = Projects.find(p => p.title === inValue.main_type);
  return rec.id;
};

const getProposalSubTypeType = (inValue: { main_type: string; sub_type: string }) => {
  const rec = Projects.find(p => p.title === inValue.main_type);
  const rec2 = rec.subProjects.find(p => p.title === inValue.sub_type);
  return rec2 ? rec2.id : null;
};

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

const getCategory = (cat: String) => {
  const rec = GENERAL.ScienceCategory.find(p => p.label === cat);
  return rec ? rec.value : 0;
};

const getSubCategory = () => {
  return 1;
};

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

const getIntegrationTimeUnits = (inValue: String) => {
  const unitsList = OBSERVATION.Supplied.find(s => s.label === 'Integration Time')?.units;
  return unitsList.find(u => u.label === inValue)?.value;
};

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
