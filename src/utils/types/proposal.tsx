import { FileUploadStatus } from '@ska-telescope/ska-gui-components';
import { TYPE_CONTINUUM } from '../constants';
import { DocumentBackend, DocumentPDF } from './document';
import {
  DataProductSDPNew,
  DataProductSDPsBackend,
  DataProductSRC,
  DataProductSRCNetBackend
} from './dataProduct';
import GroupObservation from './groupObservation';
import Observation from './observation';
import { SensCalcResultsBackend } from './sensCalcResults';
import Target, { TargetBackend } from './target';
import TargetObservation from './targetObservation';
import Investigator, { InvestigatorBackend } from './investigator';
import { ObservationSetBackend } from './observationSet';
import { Metadata } from './metadata';
import { CalibrationStrategy, CalibrationStrategyBackend } from './calibrationStrategy';

export type ProposalBackend = {
  prsl_id: string;
  status: string;
  submitted_by?: string;
  submitted_on: string | null; // note: null since oso-services 1.1.0 does not support ''
  investigator_refs?: string[];
  metadata?: Metadata;
  cycle: string | null;
  proposal_info: {
    title: string;
    proposal_type: {
      main_type: string;
      attributes?: string[];
    };
    abstract: string | null;
    science_category?: string;
    investigators: InvestigatorBackend[] | null;
  };
  observation_info: {
    targets: TargetBackend[];
    documents: DocumentBackend[] | null;
    observation_sets: ObservationSetBackend[] | null;
    calibration_strategy: CalibrationStrategyBackend[];
    data_product_sdps: DataProductSDPsBackend[] | null;
    data_product_src_nets: DataProductSRCNetBackend[] | null;
    result_details: SensCalcResultsBackend[] | null;
  };
};

export type Proposal = {
  metadata?: Metadata;
  id: string;
  title: string;
  status: string;
  lastUpdated: string;
  lastUpdatedBy: string;
  createdOn: string;
  createdBy: string;
  version: number;
  cycle: string | null;
  proposalType: number;
  proposalSubType?: number[];
  scienceCategory: number;
  scienceSubCategory?: number[];
  investigators?: Investigator[];
  abstract?: string;
  sciencePDF: DocumentPDF | null;
  scienceLoadStatus?: number;
  targetOption?: number;
  targets?: Target[];
  observations?: Observation[];
  groupObservations?: GroupObservation[];
  targetObservation?: TargetObservation[];
  calibrationStrategy: CalibrationStrategy[];
  technicalPDF: DocumentPDF | null;
  technicalLoadStatus?: number;
  dataProductSDP?: DataProductSDPNew[];
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
  scienceCategory: TYPE_CONTINUUM,
  scienceSubCategory: [1],
  investigators: [],
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
