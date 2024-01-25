import Observation from './observation';
import Target from './target';
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
  scienceLoadStatus: number;
  targetOption: number;
  targets: Target[];
  observations: Observation[];
  targetObservation: TargetObservation[];
  technicalPDF: File | null;
  technicalLoadStatus: number;
  pipeline: string;
};
