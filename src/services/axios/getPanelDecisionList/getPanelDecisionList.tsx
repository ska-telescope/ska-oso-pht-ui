import {
  OSO_SERVICES_PANEL_DECISIONS_PATH,
  SKA_OSO_SERVICES_URL,
  USE_LOCAL_DATA
} from '../../../utils/constants';
import { mappingPanelDecisionBackendToFrontend } from '../putPanelDecision/putPanelDecision';
import useAxiosAuthClient from '../axiosAuthClient/axiosAuthClient';
import { MockPanelDecisionBackendList } from './mockPanelDecisionBackendList';
import { PanelDecision, PanelDecisionBackend } from '@/utils/types/panelDecision';
import { getUniqueMostRecentItems } from '@/utils/helpers';

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

async function getPanelDecisionList(
  authAxiosClient: ReturnType<typeof useAxiosAuthClient>,
  cycleId: string
): Promise<PanelDecision[] | string> {
  if (USE_LOCAL_DATA) {
    return getMockPanelDecision(cycleId);
  }

  try {
    const URL_PATH = `${OSO_SERVICES_PANEL_DECISIONS_PATH}/list/DefaultUser`;

    const result = await authAxiosClient.get(`${SKA_OSO_SERVICES_URL}${URL_PATH}`);

    if (!result || !Array.isArray(result.data)) {
      return 'error.API_UNKNOWN_ERROR';
    }
    const uniqueResults: PanelDecisionBackend[] =
      result.data?.length > 1 ? getUniqueMostRecentItems(result.data, 'decision_id') : result.data;
    return mappingList(uniqueResults, cycleId) as PanelDecision[];
  } catch (e) {
    if (e instanceof Error) {
      return e.message;
    }
    return 'error.API_UNKNOWN_ERROR';
  }
}

export default getPanelDecisionList;
