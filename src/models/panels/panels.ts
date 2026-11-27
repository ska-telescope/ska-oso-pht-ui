import { Panel } from '@utils/types/panel.tsx';
import { Metadata } from '@utils/types/metadata.tsx';
import { PanelProposal } from '@utils/types/panelProposal.tsx';
import { PanelReviewer } from '@utils/types/panelReviewer.tsx';
import { getUniqueMostRecentItems } from '@utils/helpers.ts';
import type {
  Panel as PanelPDM,
  ProposalAssignment,
  ReviewerAssignment,
  ReviewerStatus
} from '@/generated/models';

const proposalFromPdm = (proposal: ProposalAssignment, panelId: string): PanelProposal => ({
  panelId,
  proposalId: proposal.prsl_id,
  assignedOn: proposal.assigned_on
});

const reviewerFromPdm = (reviewer: ReviewerAssignment, panelId: string): PanelReviewer => ({
  panelId,
  reviewerId: reviewer.reviewer_id,
  assignedOn: reviewer.assigned_on,
  status: reviewer.status as string
});

/**
 * A panel as the PMT holds it. Its cycle is left out, so that a save gives it the current cycle
 * (see panelToPdm).
 */
export const panelFromPdm = (pdm: PanelPDM): Panel => {
  const panelId = pdm.panel_id as string;
  return {
    id: panelId,
    // The ODA fills in the metadata of all it stores, so the PDM's optional fields are present
    metadata: pdm.metadata as Metadata,
    name: pdm.name,
    expiresOn: pdm.expiry_date ?? undefined,
    proposals: (pdm.proposals ?? []).map((proposal) => proposalFromPdm(proposal, panelId)),
    sciReviewers: (pdm.sci_reviewers ?? []).map((reviewer) => reviewerFromPdm(reviewer, panelId)),
    tecReviewers: (pdm.tech_reviewers ?? []).map((reviewer) => reviewerFromPdm(reviewer, panelId))
  };
};

/** The panels, keeping only the latest version of each (the ODA can return several). */
export const panelsFromPdm = (pdms: PanelPDM[]): Panel[] =>
  (pdms.length > 1 ? (getUniqueMostRecentItems(pdms, 'panel_id') as PanelPDM[]) : pdms).map(
    panelFromPdm
  );

/**
 * The PDM to save the panel as, in its own cycle or else the given one. A proposal or reviewer
 * assigned since it was loaded has no assignment date yet, so it is assigned now.
 */
export const panelToPdm = (panel: Panel, cycleId: string): PanelPDM => {
  const now = new Date().toISOString();
  const reviewerToPdm = (reviewer: PanelReviewer): ReviewerAssignment => ({
    reviewer_id: reviewer.reviewerId,
    assigned_on: reviewer.assignedOn || now,
    status: reviewer.status as ReviewerStatus
  });
  return {
    panel_id: panel.id,
    cycle: panel.cycle || cycleId,
    name: panel.name,
    expiry_date: panel.expiresOn,
    proposals: panel.proposals.map((proposal) => ({
      prsl_id: proposal.proposalId,
      assigned_on: proposal.assignedOn || now
    })),
    sci_reviewers: panel.sciReviewers.map(reviewerToPdm),
    tech_reviewers: panel.tecReviewers.map(reviewerToPdm)
  };
};
