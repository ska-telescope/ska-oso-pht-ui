import { TeamMember } from './teamMember';

export type Proposal = {
  id: number;
  title: string;
  proposalType: number;
  proposalSubType: number;
  // General
  abstract: string;
  category: number;
  subCategory: number;
  // Team
  team: TeamMember[];
};
