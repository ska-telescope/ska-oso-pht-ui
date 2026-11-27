import { PanelDecision } from '@utils/types/panelDecision.tsx';
import { Metadata } from '@utils/types/metadata.tsx';
import { getUniqueMostRecentItems } from '@utils/helpers.ts';
import type {
  PanelDecision as PanelDecisionPDM,
  PanelReviewStatus,
  Recommendation
} from '@/generated/models';

/** A panel's decision on a proposal, in the given cycle unless it has its own. */
export const panelDecisionFromPdm = (pdm: PanelDecisionPDM, cycleId: string): PanelDecision => ({
  id: pdm.decision_id as string,
  panelId: pdm.panel_id,
  cycle: pdm.cycle || cycleId,
  proposalId: pdm.prsl_id,
  // The ODA fills in the metadata of all it stores, so the PDM's optional fields are present
  metaData: pdm.metadata as Metadata,
  recommendation: pdm.recommendation as string,
  rank: pdm.rank as number,
  status: pdm.status as string
});

/** The decisions, keeping only the latest version of each (the ODA can return several). */
export const panelDecisionsFromPdm = (pdms: PanelDecisionPDM[], cycleId: string): PanelDecision[] =>
  (pdms.length > 1
    ? (getUniqueMostRecentItems(pdms, 'decision_id') as PanelDecisionPDM[])
    : pdms
  ).map((pdm) => panelDecisionFromPdm(pdm, cycleId));

/**
 * The PDM to save the decision as, in its own cycle or else the given one. Who decided it, and
 * when, are not part of the PDM (its metadata records the change).
 */
export const panelDecisionToPdm = (decision: PanelDecision, cycleId: string): PanelDecisionPDM => ({
  decision_id: decision.id,
  panel_id: decision.panelId,
  cycle: decision.cycle || cycleId,
  prsl_id: decision.proposalId,
  recommendation: decision.recommendation as Recommendation,
  rank: decision.rank,
  status: decision.status as PanelReviewStatus
});
