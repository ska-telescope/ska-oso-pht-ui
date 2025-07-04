import { Metadata } from './metadata';
import { PanelProposal, PanelProposalBackend } from './panelProposal';
import { PanelReviewer } from './panelReviewer';

export type Panel = {
  metadata?: Metadata;
  id: string;
  name: string;
  expiresOn?: string;
  proposals: PanelProposal[];
  reviewers: PanelReviewer[];
};

export type PanelBackend = {
  metadata?: Metadata;
  panel_id: string;
  cycle: string;
  name: string;
  expires_on?: string;
  proposals: PanelProposalBackend[];
  reviewers: PanelReviewer[];
};
