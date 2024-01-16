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
<<<<<<< HEAD
  sciencePDF: File|null;
=======
  // Science
  sciencePDF: File | null;
  // Target
>>>>>>> main
  targetOption: number;
  targets: Target[];
  observations: Observation[];
<<<<<<< HEAD
  targetObservation: TargetObservation[];
  technicalPDF: File|null;
=======
  // Technical
  technicalPDF: File | null;
  // data
>>>>>>> main
  pipeline: string;
};
