import axios from 'axios';
import {
  OSO_SERVICES_PANEL_DECISIONS_PATH,
  SKA_OSO_SERVICES_URL,
  USE_LOCAL_DATA
} from '../../../utils/constants';
import { mappingPostPanelDecision } from '../postPanelDecision/postPanelDecision';
import { MockPanelDecisionBackend } from '../postPanelDecision/mockPanelDecisionBackend';
import { PanelDecision, PanelDecisionBackend } from '@/utils/types/panelDecision';

export function putMockPanelDecision(): PanelDecisionBackend {
  return MockPanelDecisionBackend;
}

async function PutPanelDecision(
  id: string,
  PanelDecision: PanelDecision
): Promise<PanelDecisionBackend | { error: string }> {
  if (USE_LOCAL_DATA) {
    return putMockPanelDecision();
  }

  try {
    const URL_PATH = `${OSO_SERVICES_PANEL_DECISIONS_PATH}/${id}`;
    const convertedPanelDecision = mappingPostPanelDecision(PanelDecision);

    const result = await axios.put(`${SKA_OSO_SERVICES_URL}${URL_PATH}`, convertedPanelDecision);

    if (!result) {
      return { error: 'error.API_UNKNOWN_ERROR' };
    }
    return result.data as PanelDecisionBackend; // TODO add backend->frontend mapping to return in front-end format
  } catch (e) {
    if (e instanceof Error) {
      return { error: e.message };
    }
    return { error: 'error.API_UNKNOWN_ERROR' };
  }
}

export default PutPanelDecision;
