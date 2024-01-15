import Target from './Target';
import Observation from './observation';
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
  // Science
  sciencePDF: File | null;
  // Target
  targetOption: number;
  targets: Target[];
  // Observation
  observations: Observation[];
  // Technical
  technicalPDF: File | null;
  // data
  pipeline: string;
};
