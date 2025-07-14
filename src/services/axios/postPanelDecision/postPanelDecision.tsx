import axios from 'axios';
import {
  CYCLE,
  OSO_SERVICES_PANEL_DECISIONS_PATH,
  SKA_OSO_SERVICES_URL,
  USE_LOCAL_DATA
} from '../../../utils/constants';
import { helpers } from '@/utils/helpers';
import { PanelDecision, PanelDecisionBackend } from '@/utils/types/panelDecision';

// mapping frontend to backend format
export function mappingPostPanelDecision(decision: PanelDecision): PanelDecisionBackend {
  const transformedPanel: PanelDecisionBackend = {
    decision_id: decision.id,
    panel_id: decision.panelId,
    cycle: decision.cycle ? decision.cycle : CYCLE, // hardcoded for now
    prsl_id: decision.proposalId,
    decided_on: decision.decidedOn,
    decided_by: decision.decidedBy,
    metaData: decision.metaData,
    recommendation: decision.recommendation,
    rank: decision.rank,
    status: decision.status
  };
  // trim undefined properties
  helpers.transform.trimObject(transformedPanel);
  return transformedPanel;
}

export function postMockPanelDecision(): string {
  return 'PANEL-DECISION-ID-001';
}

async function PostPanelDecision(
  PanelDecision: PanelDecision
): Promise<string | { error: string }> {
  if (USE_LOCAL_DATA) {
    return postMockPanelDecision();
  }

  try {
    const URL_PATH = `${OSO_SERVICES_PANEL_DECISIONS_PATH}/`;
    const convertedPanelDecision = mappingPostPanelDecision(PanelDecision);

    const result = await axios.post(`${SKA_OSO_SERVICES_URL}${URL_PATH}`, convertedPanelDecision);

    if (!result) {
      return { error: 'error.API_UNKNOWN_ERROR' };
    }
    return result.data as string;
  } catch (e) {
    if (e instanceof Error) {
      return { error: e.message };
    }
    return { error: 'error.API_UNKNOWN_ERROR' };
  }
}

export default PostPanelDecision;
