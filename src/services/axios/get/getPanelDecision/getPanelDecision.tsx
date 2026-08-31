import { OSO_SERVICES_PANEL_DECISIONS_PATH, SKA_OSO_SERVICES_URL } from '@utils/constants.ts';
import { MockPanelDecisionBackend } from '@services/axios/post/postPanelDecision/mockPanelDecisionBackend.tsx';
import { mappingPanelDecisionBackendToFrontend } from '@services/axios/put/putPanelDecision/putPanelDecision.tsx';
import { PanelDecision } from '@utils/types/panelDecision.tsx';
import { AxiosAuthClient } from '../../axiosAuthClient/axiosAuthClient.tsx';

export function getMockPanelDecision(cycleId: string): PanelDecision {
  return mappingPanelDecisionBackendToFrontend(MockPanelDecisionBackend, cycleId);
}

async function getPanelDecision(
  authAxiosClient: AxiosAuthClient,
  id: string,
  cycleId: string
): Promise<PanelDecision | { error: string }> {
  try {
    const URL_PATH = `${OSO_SERVICES_PANEL_DECISIONS_PATH}/${id}`;

    const result = await authAxiosClient.get(`${SKA_OSO_SERVICES_URL}${URL_PATH}`);

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
