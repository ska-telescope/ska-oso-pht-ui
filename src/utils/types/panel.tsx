import { Metadata } from './metadata';
import { PanelProposal } from './panelProposal';
import { PanelReviewer } from './panelReviewer';

export type Panel = {
  metadata?: Metadata;
  id: string;
  name: string;
  expiresOn?: string;
  cycle?: string;
  proposals: PanelProposal[];
  sciReviewers: PanelReviewer[];
  tecReviewers: PanelReviewer[];
};
