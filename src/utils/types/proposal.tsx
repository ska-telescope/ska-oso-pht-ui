import { FileUploadStatus } from '@ska-telescope/ska-gui-components';
import { ProposalSubTypeType, ProposalTypeType } from '../constants';
import { DocumentPDF } from './document';
import { DataProductSDPNew, DataProductSRC } from './dataProduct';
import GroupObservation from './groupObservation';
import Observation from './observation';
import Target from './target';
import TargetObservation from './targetObservation';
import Investigator from './investigator';
import { Metadata } from './metadata';
import { CalibrationStrategy } from './calibrationStrategy';
import type { Proposal as ProposalPDM } from '@/generated/models/proposal';

// investigator_refs is not part of the PDM, but it is still sent when saving a proposal
export type ProposalBackend = ProposalPDM & { investigator_refs?: string[] };

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
  proposalType?: ProposalTypeType;
  proposalSubType?: ProposalSubTypeType[];
  // TODO: narrow this type down to just number | null
  scienceCategory: number | string | null;
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
  proposalType: undefined,
  proposalSubType: [],
  scienceCategory: null,
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
