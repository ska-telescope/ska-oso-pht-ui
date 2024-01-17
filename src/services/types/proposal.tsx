import Observation from './observation';
import Target from './targetTemp';
import TargetObservation from './targetObservation';
import TeamMember from './teamMember';

export type Proposal = {
  id: number;
  title: string;
  proposalType: number;
  proposalSubType: number;
  team: TeamMember[];
  abstract: string;
  category: number;
  subCategory: number;
  sciencePDF: File | null;
  targetOption: number;
  targets: Target[];
  observations: Observation[];
  targetObservation: TargetObservation[];
  technicalPDF: File | null;
  pipeline: string;
};
