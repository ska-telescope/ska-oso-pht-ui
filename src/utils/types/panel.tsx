import { Metadata } from './metadata';
import { PanelProposal } from './panelProposal';
import { PanelReviewer } from './panelReviewer';

export type Panel = {
  metaData?: Metadata;
  id: string;
  name: string;
  createdOn: Date;
  ExpiresOn: Date;
  proposals: PanelProposal[];
  reviewers: PanelReviewer[];
};
