import { Metadata } from './metadata';
import { PanelProposal } from './panelProposal';
import { PanelReviewer } from './panelReviewer';

export type Panel = {
  metadata?: Metadata;
  id: string;
  name: string;
  createdOn?: string;
  expiresOn?: string;
  proposals: PanelProposal[];
  reviewers: PanelReviewer[];
};

export type PanelBackend = {
  metadata?: Metadata;
  panel_id: string;
  cycle: string;
  name: string;
  createdOn?: string;
  expiresOn?: string;
  proposals: PanelProposal[];
  reviewers: PanelReviewer[];
};
