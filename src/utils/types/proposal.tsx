import { DocumentBackend } from './document';
import DataProduct, { DataProductSDPsBackend, DataProductSRCNetBackend } from './dataProduct';
import GroupObservation from './groupObservation';
import Observation from './observation';
import { ResultBackend } from './result';
// import { ScienceProgrammeBackend } from './scienceProgrammes';
import Target, { TargetBackend } from './target';
import TargetObservation from './targetObservation';
import TeamMember, { TeamMemberBackend } from './teamMember';
import { ObservationSetBackend } from './observationSet';

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
  prsl_id: string; // TODO: modify type names as prsl?
  status: string;
  submitted_by: string;
  submitted_on: string;
  investigator_refs: string[];
  metadata: {
    version: number;
    created_by: string;
    created_on: string;
    last_modified_by: string;
    last_modified_on: string;
  };
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
    investigators: TeamMemberBackend[]; // TODO: create investigatorBackend type instead of teamMember
    observation_sets: ObservationSetBackend[];
    data_product_sdps: DataProductSDPsBackend[];
    data_product_src_nets: DataProductSRCNetBackend[];
    results: ResultBackend[];
  };
};

export type Proposal = {
  id: string;
  title: string;
  proposalType: number;
  proposalSubType: number[];
  team: TeamMember[];
  abstract: string;
  category: number;
  subCategory: number[];
  sciencePDF: File | null;
  scienceLoadStatus: number;
  targetOption: number;
  targets: Target[];
  observations: Observation[];
  groupObservations: GroupObservation[];
  targetObservation: TargetObservation[];
  technicalPDF: File | null;
  technicalLoadStatus: number;
  dataProducts: DataProduct[];
  pipeline: string;
};

export default Proposal;
