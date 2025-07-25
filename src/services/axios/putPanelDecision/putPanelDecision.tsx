import axios from 'axios';
import {
  OSO_SERVICES_PANEL_DECISIONS_PATH,
  SKA_OSO_SERVICES_URL,
  USE_LOCAL_DATA
} from '../../../utils/constants';
import { mappingPanelDecisionFrontendToBackend } from '../postPanelDecision/postPanelDecision';
import { MockPanelDecisionBackend } from '../postPanelDecision/mockPanelDecisionBackend';
import { PanelDecision, PanelDecisionBackend } from '@/utils/types/panelDecision';
import { helpers } from '@/utils/helpers';

// mapping backend to frontend format
export function mappingPanelDecisionBackendToFrontend(
  decision: PanelDecisionBackend,
  cycleId: string
): PanelDecision {
  const transformedPanel: PanelDecision = {
    id: decision.decision_id,
    panelId: decision.panel_id,
    cycle: decision.cycle ? decision.cycle : cycleId, // use cycleId if not provided
    proposalId: decision.prsl_id,
    decidedOn: decision.decided_on,
    decidedBy: decision.decided_by,
    metaData: decision.metaData,
    recommendation: decision.recommendation,
    rank: decision.rank,
    status: decision.status
  };
  // trim undefined properties
  helpers.transform.trimObject(transformedPanel);
  return transformedPanel;
}

export function putMockPanelDecision(cycleId: string): PanelDecision {
  return mappingPanelDecisionBackendToFrontend(MockPanelDecisionBackend, cycleId);
}

async function PutPanelDecision(
  id: string,
  PanelDecision: PanelDecision,
  cycleId: string
): Promise<PanelDecision | { error: string }> {
  if (USE_LOCAL_DATA) {
    return putMockPanelDecision(cycleId);
  }

  try {
    const URL_PATH = `${OSO_SERVICES_PANEL_DECISIONS_PATH}/${id}`;
    const convertedPanelDecision = mappingPanelDecisionFrontendToBackend(PanelDecision, cycleId);

    const result = await axios.put(`${SKA_OSO_SERVICES_URL}${URL_PATH}`, convertedPanelDecision);

    if (!result || !result.data) {
      return { error: 'error.API_UNKNOWN_ERROR' };
    }
    return mappingPanelDecisionBackendToFrontend(result.data, cycleId) as PanelDecision;
  } catch (e) {
    if (e instanceof Error) {
      return { error: e.message };
    }
    return { error: 'error.API_UNKNOWN_ERROR' };
  }
}

export default PutPanelDecision;
