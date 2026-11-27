import { Panel } from '@utils/types/panel.tsx';
import { panelFromPdm, panelsFromPdm, panelToPdm } from '@/models/panels/panels';
import type {
  Panel as PanelPDM,
  ResponseAutoAssignToPanelOsoApiV17PhtPanelsAssignmentsPost,
  ResponseAutoCreatePanelOsoApiV17PhtPanelsGeneratePost
} from '@/generated/models';
import { type ApiResult, callApi, UNKNOWN_API_ERROR } from './apiResult';
import { api } from './client';

/** The review panels, the latest version of each. */
export const listPanels = (): Promise<ApiResult<Panel[]>> =>
  callApi(
    () => api.panels.getPanelsOsoApiV17PhtPanelsGet(),
    (data: PanelPDM[]) => {
      // A list response that isn't a list is malformed, so it is an error rather than no panels
      if (!Array.isArray(data)) {
        throw new Error(UNKNOWN_API_ERROR);
      }
      return panelsFromPdm(data);
    }
  );

/** Saves the panel, in its own cycle or else the given one, returning the panel as stored. */
export const updatePanel = (panel: Panel, cycleId: string): Promise<ApiResult<Panel>> =>
  callApi(
    () => api.panels.updatePanelOsoApiV17PhtPanelsPanelIdPut(panel.id, panelToPdm(panel, cycleId)),
    panelFromPdm
  );

/** Has the ODA create the cycle's panels, one for each science category. */
export const generatePanels = (): Promise<
  ApiResult<ResponseAutoCreatePanelOsoApiV17PhtPanelsGeneratePost>
> => callApi(() => api.panels.autoCreatePanelOsoApiV17PhtPanelsGeneratePost());

/** Has the ODA assign the cycle's submitted proposals to its panels. */
export const assignToPanels = (
  cycleDescription: string
): Promise<ApiResult<ResponseAutoAssignToPanelOsoApiV17PhtPanelsAssignmentsPost>> =>
  callApi(() => api.panels.autoAssignToPanelOsoApiV17PhtPanelsAssignmentsPost(cycleDescription));
