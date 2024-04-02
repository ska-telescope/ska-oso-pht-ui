import DataProduct from './dataProduct';
import Observation from './observation';
import { ScienceProgrammeBackend } from './scienceProgrammes';
import Target, { TargetBackend } from './target';
import TargetObservation from './targetObservation';
import TeamMember, { TeamMemberBackend } from './teamMember';

export type ProposalBackend = {
  prsl_id: string;
  status: string;
  submitted_by: string;
  submitted_on: string;
  proposal_info: {
    title: string;
    cycle: string;
    abstract: string;
    proposal_type: {
      main_type: string;
      sub_type: string;
    };
    science_category: string;
    targets: TargetBackend[];
    investigators: TeamMemberBackend[];
    science_programmes: ScienceProgrammeBackend[];
  };
};

export type Proposal = {
  id: string;
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
  dataProducts: DataProduct[];
  pipeline: string;
  details: string;
};

export default Proposal;
