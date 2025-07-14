import { Metadata } from './metadata';

export type PanelDecision = {
  metaData?: Metadata;
  id: string;
  cycle: string;
  panelId: string;
  proposalId: string;
  rank: number;
  recommendation: string;
  decidedBy: string; // question: would the metadata not cover this?
  decidedOn: string; // question: would the metadata not cover this?
  status: string;
};

export type PanelDecisionBackend = {
  metaData?: Metadata;
  decision_id: string;
  cycle: string;
  panel_id: string;
  prsl_id: string;
  rank: number;
  recommendation: string;
  decided_by: string; // question: would the metadata not cover this?
  decided_on: string; // question: would the metadata not cover this?
  status: string;
};
