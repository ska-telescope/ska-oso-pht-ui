import { ProposalSubTypeType, ProposalTypeType } from '../constants';
import { DocumentPDF } from './document';
import GroupObservation from './groupObservation';
import Observation from './observation';
import Target from './target';
import TargetObservation from './targetObservation';
import Investigator from './investigator';
import { Metadata } from './metadata';
import { CalibrationStrategy } from './calibrationStrategy';
import type { DataProductInput } from '@/models/proposals/dataProducts';
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
  // The form's data products. The store holds a copy for readers not yet moved to the form
  dataProducts?: DataProductInput[];
  pipeline?: string;
};

export default Proposal;
