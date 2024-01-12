import Target from './Target';
import TeamMember from './teamMember';

export type Proposal = {
  id: number;
  title: string;
  proposalType: number;
  proposalSubType: number;
  // Team
  team: TeamMember[];
  // General
  abstract: string;
  category: number;
  subCategory: number;
  // Target
  targetOption: number;
  targets: Target[];
};
