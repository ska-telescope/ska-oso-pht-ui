import axios from 'axios';
import {
  GENERAL,
  OBSERVATION,
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
import NewMockProposal from './newMockProposal';

const getProposalType = (inValue: { main_type: string; sub_type: string }) => {
  const rec = Projects.find(p => p.title === inValue.main_type);
  return rec.id;
};

const getProposalSubTypeType = (inValue: { main_type: string; sub_type: string }) => {
  const rec = Projects.find(p => p.title === inValue.main_type);
  const rec2 = rec.subProjects.find(p => p.title === inValue.sub_type);
  return rec2.id;
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
  for (let i = 0; i < inValue.length - 1; i++) {
    results.push({
      dec: inValue[i].declination.toString(),
      decUnits: inValue[i].declination_unit,
      id: i + 1,
      name: inValue[i].name,
      ra: inValue[i].right_ascension.toString(),
      raUnits: inValue[i].right_ascension_unit,
      referenceFrame: '',
      vel: inValue[i].velocity.toString(),
      velUnits: inValue[i].velocity_unit
    });
  }
  return results;
};

const getObservations = (inValue: ScienceProgrammeBackend[]) => {
  let results = [];
  for (let i = 0; i < inValue.length; i++) {
    const arr = inValue[i].array === 'MID' ? 1 : 2;
    const sub = OBSERVATION.array[arr - 1].subarray.find(p => p.label === inValue[i].subarray);
    const typ = OBSERVATION.ObservationType.find(p => p.label === inValue[i].observation_type);
    results.push({
      id: i + 1,
      telescope: arr,
      subarray: sub ? sub : 0,
      type: typ ? typ.value : 0
    });
  }
  return results;
};

function mapping(inRec: ProposalBackend) {
  return {
    id: inRec.prsl_id,
    title: inRec.proposal_info.title,
    proposalType: getProposalType(inRec.proposal_info.proposal_type),
    proposalSubType: getProposalSubTypeType(inRec.proposal_info.proposal_type),
    team: getTeamMembers(inRec.proposal_info.investigators),
    abstract: inRec.proposal_info.abstract,
    category: getCategory(inRec.proposal_info.science_category),
    subCategory: getSubCategory(),
    sciencePDF: null,
    scienceLoadStatus: 0,
    targetOption: 1,
    targets: getTargets(inRec.proposal_info.targets),
    observations: getObservations(inRec.proposal_info.science_programmes),
    targetObservation: [],
    technicalPDF: null,
    technicalLoadStatus: 0,
    dataProducts: [],
    pipeline: ''
  } as Proposal;
}

export function GetMockProposal(): Proposal {
  return mapping(MockProposal);
}

async function GetProposal(id: string): Promise<Proposal | string> {
  const apiUrl = SKA_PHT_API_URL;
  const URL_GET = `/proposals/`;
  const config = {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  };

  if (USE_LOCAL_DATA) {
    return GetMockProposal();
  }

  try {
    const result = await axios.get(`${apiUrl}${URL_GET}${id}`, config);
    console.log('PROPOSAL in getProposal service', result);
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : mapping(result.data);
  } catch (e) {
    return e.message;
  }
}

export default GetProposal;
