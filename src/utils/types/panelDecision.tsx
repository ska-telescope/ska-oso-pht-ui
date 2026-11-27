import { Metadata } from './metadata';

export type PanelDecision = {
  metaData?: Metadata;
  id: string;
  cycle: string;
  panelId: string;
  proposalId: string;
  rank: number;
  recommendation: string;
  status: string;
};
