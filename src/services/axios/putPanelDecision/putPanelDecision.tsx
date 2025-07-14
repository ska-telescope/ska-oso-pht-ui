import axios from 'axios';
import {
  OSO_SERVICES_PANEL_DECISIONS_PATH,
  SKA_OSO_SERVICES_URL,
  USE_LOCAL_DATA
} from '../../../utils/constants';
import { MockPanelDecisionFrontend } from '../postPanelDecision/mockPanelDecisionFrontend';
import { PanelDecision } from '@/utils/types/panelDecision';
import { mappingPostPanelDecision } from '../postPanelDecision/postPanelDecision';

export function postMockPanelDecision(): PanelDecision {
  return MockPanelDecisionFrontend;
}

async function PutPanelDecision(
  id: string,
  PanelDecision: PanelDecision
): Promise<PanelDecision | { error: string }> {
  if (USE_LOCAL_DATA) {
    return postMockPanelDecision();
  }

  try {
    const URL_PATH = `${OSO_SERVICES_PANEL_DECISIONS_PATH}/${id}`;
    const convertedPanelDecision = mappingPostPanelDecision(PanelDecision);

    const result = await axios.put(`${SKA_OSO_SERVICES_URL}${URL_PATH}`, convertedPanelDecision);

    if (!result) {
      return { error: 'error.API_UNKNOWN_ERROR' };
    }
    return (mappingPostPanelDecision(result.data) as unknown) as PanelDecision;
  } catch (e) {
    if (e instanceof Error) {
      return { error: e.message };
    }
    return { error: 'error.API_UNKNOWN_ERROR' };
  }
}

export default PutPanelDecision;
