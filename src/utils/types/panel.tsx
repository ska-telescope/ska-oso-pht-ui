import { Metadata } from './metadata';
import { PanelProposal } from './panelProposal';
import { PanelReviewer } from './panelReviewer';

export type Panel = {
  metaData?: Metadata;
  id: string;
  name: string;
  createdOn: string;
  expiresOn: string;
  proposals: PanelProposal[];
  reviewers: PanelReviewer[];
};
