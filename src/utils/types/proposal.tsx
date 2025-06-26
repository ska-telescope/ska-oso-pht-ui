import { FileUploadStatus } from '@ska-telescope/ska-gui-components';
import { DocumentBackend, DocumentPDF } from './document';
import {
  DataProductSDP,
  DataProductSDPsBackend,
  DataProductSRCNetBackend,
  DataProductSRC
} from './dataProduct';
import GroupObservation from './groupObservation';
import Observation from './observation';
import { SensCalcResultsBackend } from './sensCalcResults';
// import { ScienceProgrammeBackend } from './scienceProgrammes';
import Target, { TargetBackend } from './target';
import TargetObservation from './targetObservation';
import TeamMember from './teamMember';
import { ObservationSetBackend } from './observationSet';
import { InvestigatorBackend } from './investigator';
import { Metadata } from './metadata';

export type ProposalBackend = {
  prsl_id: string;
  status: string;
  submitted_by?: string;
  submitted_on?: string;
  investigator_refs?: string[];
  metadata?: Metadata;
  cycle: string;
  info: {
    title: string;
    proposal_type: {
      main_type: string;
      attributes?: string[];
    };
    abstract: string;
    science_category: string;
    targets: TargetBackend[];
    documents: DocumentBackend[] | null;
    investigators: InvestigatorBackend[] | null;
    observation_sets: ObservationSetBackend[] | null;
    data_product_sdps: DataProductSDPsBackend[] | null;
    data_product_src_nets: DataProductSRCNetBackend[] | null;
    result_details: SensCalcResultsBackend[] | null;
  };
};

export type Proposal = {
  id: string;
  title: string;
  status: string;
  lastUpdated: string;
  lastUpdatedBy: string;
  createdOn: string;
  createdBy: string;
  version: number;
  cycle: string;
  proposalType: number;
  proposalSubType?: number[];
  scienceCategory: number | null;
  scienceSubCategory?: number[];
  team?: TeamMember[];
  abstract?: string;
  sciencePDF: DocumentPDF | null;
  scienceLoadStatus?: number;
  targetOption?: number;
  targets?: Target[];
  observations?: Observation[];
  groupObservations?: GroupObservation[];
  targetObservation?: TargetObservation[];
  technicalPDF: DocumentPDF | null;
  technicalLoadStatus?: number;
  // dataProducts?: DataProduct[];
  dataProductSDP?: DataProductSDP[];
  dataProductSRC?: DataProductSRC[];
  pipeline?: string;
};

export const NEW_PROPOSAL = {
  id: null,
  title: '',
  status: '',
  lastUpdated: '',
  lastUpdatedBy: '',
  createdOn: '',
  createdBy: '',
  version: 0,
  cycle: '',
  proposalType: 0,
  proposalSubType: [0],
  scienceCategory: 1,
  scienceSubCategory: [1],
  team: [],
  pi: '',
  abstract: '',
  sciencePDF: null,
  scienceLoadStatus: FileUploadStatus.INITIAL,
  targetOption: 1,
  targets: [],
  observations: [],
  groupObservations: [],
  targetObservation: [],
  technicalPDF: null,
  technicalLoadStatus: FileUploadStatus.INITIAL,
  dataProductSDP: [],
  dataProductSRC: [],
  pipeline: ''
};

export default Proposal;
