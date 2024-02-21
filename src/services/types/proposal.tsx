import Observation from './observation';
import Target, { TargetIN } from './target';
import TargetObservation from './targetObservation';
import TeamMember, { TeamMemberIN } from './teamMember';

// Science Programme. Part of the incoming proposal
export type SP = {
  array: string;
  subarray: string;
  linked_sources: string[];
  observation_type: string;
};

export type ProposalIN = {
  prsl_id: string;
  status: string;
  submitted_by: string;
  submitted_on: string;
  proposal_info: {
    title: string;
    cycle: string;
    abstract: string;
    proposal_type: {
      type: string;
      sub_type: string;
    };
    science_category: string;
    targets: TargetIN[];
    investigator: TeamMemberIN[];
    science_programmes: SP[];
  };
};

type Proposal = {
  id: number;
  title: string;
  proposalType: number;
  proposalSubType: number;
  team: TeamMember[];
  abstract: string;
  category: number;
  subCategory: number;
  sciencePDF: File | null;
  scienceLoadStatus: number;
  targetOption: number;
  targets: Target[];
  observations: Observation[];
  targetObservation: TargetObservation[];
  technicalPDF: File | null;
  technicalLoadStatus: number;
  pipeline: string;
};

export default Proposal;
