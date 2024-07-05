import { DocumentBackend } from './document';
import DataProduct, { DataProductSDPsBackend, DataProductSRCNetBackend } from './dataProduct';
import GroupObservation from './groupObservation';
import Observation from './observation';
import { ResultBackend } from './result';
// import { ScienceProgrammeBackend } from './scienceProgrammes';
import Target, { TargetBackend } from './target';
import TargetObservation from './targetObservation';
import TeamMember from './teamMember';
import { ObservationSetBackend } from './observationSet';
import { InvestigatorBackend } from './investigator';
import { Metadata } from './metadata';

/*
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
*/

export type ProposalBackend = {
  prsl_id: string;
  status: string;
  submitted_by?: string;
  submitted_on?: string;
  investigator_refs: string[];
  metadata?: Metadata;
  cycle: string;
  info: {
    title: string;
    proposal_type: {
      main_type: string;
      sub_type: string[];
    };
    abstract: string;
    science_category: string;
    targets: TargetBackend[];
    documents: DocumentBackend[];
    investigators: InvestigatorBackend[];
    observation_sets: ObservationSetBackend[];
    data_product_sdps: DataProductSDPsBackend[];
    data_product_src_nets: DataProductSRCNetBackend[];
    results: ResultBackend[];
  };
};

export type Proposal = {
  id: string;
  title: string;
  status: string;
  lastUpdated: string;
  cycle: string;
  proposalType: number;
  proposalSubType: number[];
  team?: TeamMember[];
  pi?: string;
  abstract?: string;
  category?: number;
  subCategory?: number[];
  sciencePDF?: File | null;
  scienceLoadStatus?: number;
  targetOption?: number;
  targets?: Target[];
  observations?: Observation[];
  groupObservations?: GroupObservation[];
  targetObservation?: TargetObservation[];
  technicalPDF?: File | null;
  technicalLoadStatus?: number;
  dataProducts?: DataProduct[];
  pipeline?: string;
};

export default Proposal;
