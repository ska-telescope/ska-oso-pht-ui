import { ScienceProgrammeBackend } from './scienceProgrammes';
import { TargetBackend } from './target';
import { TeamMemberBackend } from './teamMember';

export type ProposalsBackend = {
  prsl_id: number;
  status: string;
  cycle: string;
  submitted_by: string;
  submitted_on: string;
  proposal_info: {
    title: string;
    cycle: string;
    abstract: string;
    proposal_type: { main_type: string; sub_type: string };
    science_category: string;
    targets: TargetBackend[];
    investigators: TeamMemberBackend[];
    science_programmes: ScienceProgrammeBackend[];
  };
};

export type Proposals = {
  id: string;
  title: string;
  cycle: string;
  pi: string;
  category: string;
  cpi: string;
  status: string;
  lastUpdated: string;
  telescope: string;
};

export default Proposals;
