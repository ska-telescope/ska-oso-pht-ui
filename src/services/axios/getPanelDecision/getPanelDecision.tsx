import axios from 'axios';
import {
  OSO_SERVICES_PANEL_DECISIONS_PATH,
  SKA_OSO_SERVICES_URL,
  USE_LOCAL_DATA
} from '../../../utils/constants';
import { MockPanelDecisionBackend } from '../postPanelDecision/mockPanelDecisionBackend';
import { mappingPanelDecisionBackendToFrontend } from '../putPanelDecision/putPanelDecision';
import { PanelDecision } from '@/utils/types/panelDecision';

export function getMockPanelDecision(cycleId: string): PanelDecision {
  return mappingPanelDecisionBackendToFrontend(MockPanelDecisionBackend, cycleId);
}

async function getPanelDecision(
  id: string,
  cycleId: string
): Promise<PanelDecision | { error: string }> {
  if (USE_LOCAL_DATA) {
    return getMockPanelDecision(cycleId);
  }

  try {
    const URL_PATH = `${OSO_SERVICES_PANEL_DECISIONS_PATH}/${id}`;

    const result = await axios.get(`${SKA_OSO_SERVICES_URL}${URL_PATH}`);

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

export default getPanelDecision;
