import axios from 'axios';
import {
  EMPTY_PROPOSAL,
  GENERAL,
  OBSERVATION,
  Projects,
  SKA_PHT_API_URL,
  TEAM_STATUS_TYPE_OPTIONS,
  USE_LOCAL_DATA
} from '../../../utils/constants';
import MockProposal from './mockProposal';
import { ProposalIN, SP } from '../../types/proposal';
import { TeamMemberIN } from '../../types/teamMember';
import { TargetIN } from 'services/types/target';

const getProposalType = (inValue: { type: string; sub_type: string }) => {
  const rec = Projects.find(p => p.title === inValue.type);
  return rec.id;
};

const getProposalSubTypeType = (inValue: { type: string; sub_type: string }) => {
  const rec = Projects.find(p => p.title === inValue.type);
  const rec2 = rec.subProjects.find(p => p.title === inValue.sub_type);
  return rec2.id;
};

const getTeamMembers = (inValue: TeamMemberIN[]) => {
  let results = [];
  for (let i = 0; i < inValue.length - 1; i++) {
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

const getTargets = (inValue: TargetIN[]) => {
  let results = [];
  for (let i = 0; i < inValue.length - 1; i++) {
    results.push({
      id: i + 1,
      name: inValue[i].name,
      ra: inValue[i].right_ascension,
      dec: inValue[i].declination,
      vel: inValue[i].velocity
    });
  }
  return results;
};

const getObservations = (inValue: SP[]) => {
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

function mapping(inRec: ProposalIN) {
  let outRec = EMPTY_PROPOSAL;
  outRec.id = inRec.prsl_id;
  outRec.title = inRec.proposal_info.title;
  outRec.proposalType = getProposalType(inRec.proposal_info.proposal_type);
  outRec.proposalSubType = getProposalSubTypeType(inRec.proposal_info.proposal_type);
  outRec.team = getTeamMembers(inRec.proposal_info.investigator);
  outRec.abstract = inRec.proposal_info.abstract;
  outRec.category = getCategory(inRec.proposal_info.science_category);
  outRec.subCategory = getSubCategory();
  outRec.sciencePDF = null;
  outRec.scienceLoadStatus = false;
  outRec.targetOption = 1;
  outRec.targets = getTargets(inRec.proposal_info.targets);
  outRec.observations = getObservations(inRec.proposal_info.science_programmes);
  // targetObservation: TargetObservation[];
  outRec.technicalPDF = null;
  outRec.technicalLoadStatus = false;
  outRec.pipeline = '';
  return outRec;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function GetProposal(id: number) {
  const apiUrl = SKA_PHT_API_URL;
  const URL_GET = `/proposal/${id}`;
  const config = {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  };

  // TODO - Need to strip out the true from this if statement

  if (true || USE_LOCAL_DATA) {
    return mapping(MockProposal);
  }

  try {
    const result = await axios.get(`${apiUrl}${URL_GET}${id}`, config);
    return typeof result === 'undefined'
      ? 'error.API_UNKNOWN_ERROR'
      : mapping(result.data.proposal_info);
  } catch (e) {
    return { error: e.message };
  }
}

export default GetProposal;
