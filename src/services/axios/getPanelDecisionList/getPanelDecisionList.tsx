import axios from 'axios';
import {
  OSO_SERVICES_PANEL_DECISIONS_PATH,
  SKA_OSO_SERVICES_URL,
  USE_LOCAL_DATA
} from '../../../utils/constants';
import { mappingPanelDecisionBackendToFrontend } from '../putPanelDecision/putPanelDecision';
import { MockPanelDecisionBackendList } from './mockPanelDecisionBackendList';
import { PanelDecision, PanelDecisionBackend } from '@/utils/types/panelDecision';

export function mappingList(
  panelDecisionList: PanelDecisionBackend[],
  cycleId: string
): PanelDecision[] {
  return panelDecisionList.map(decision =>
    mappingPanelDecisionBackendToFrontend(decision, cycleId)
  );
}

export function getMockPanelDecision(cycleId: string): PanelDecision[] {
  return mappingList(MockPanelDecisionBackendList, cycleId);
}

async function getPanelDecisionList(cycleId: string): Promise<PanelDecision[] | string> {
  if (USE_LOCAL_DATA) {
    return getMockPanelDecision(cycleId);
  }

  try {
    const URL_PATH = `${OSO_SERVICES_PANEL_DECISIONS_PATH}/list/DefaultUser`;

    const result = await axios.get(`${SKA_OSO_SERVICES_URL}${URL_PATH}`);

    if (!result || !Array.isArray(result.data)) {
      return 'error.API_UNKNOWN_ERROR';
    }
    return mappingList(result.data, cycleId) as PanelDecision[];
  } catch (e) {
    if (e instanceof Error) {
      return e.message;
    }
    return 'error.API_UNKNOWN_ERROR';
  }
}

export default getPanelDecisionList;
