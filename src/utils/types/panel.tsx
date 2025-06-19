import { Metadata } from "./metadata";
import { PanelProposal } from "./panelProposal";
import { PanelReviewer } from "./panelReviewer";

export type Panel = {
  metaData?: Metadata;
  panelId: string;
  name: string;
  cycle: string;
  proposals: PanelProposal[];
  reviewers: PanelReviewer[];
};