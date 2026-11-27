import { PanelDecision } from '@utils/types/panelDecision.tsx';
import {
  panelDecisionFromPdm,
  panelDecisionsFromPdm,
  panelDecisionToPdm
} from '@/models/panels/panelDecisions';
import type { PanelDecision as PanelDecisionPDM } from '@/generated/models';
import { type ApiResult, callApi, UNKNOWN_API_ERROR } from './apiResult';
import { api } from './client';

/** The panel decisions the user can see, the latest version of each, in the given cycle. */
export const listPanelDecisions = (cycleId: string): Promise<ApiResult<PanelDecision[]>> =>
  callApi(
    () => api.panelDecisions.getPanelDecisionsForUserOsoApiV17PhtPanelDecisionGet(),
    (data: PanelDecisionPDM[]) => {
      // A list response that isn't a list is malformed, so it is an error rather than no decisions
      if (!Array.isArray(data)) {
        throw new Error(UNKNOWN_API_ERROR);
      }
      return panelDecisionsFromPdm(data, cycleId);
    }
  );

/** Saves the decision, returning it as stored. */
export const updatePanelDecision = (decision: PanelDecision): Promise<ApiResult<PanelDecision>> =>
  callApi(
    () =>
      api.panelDecisions.updatePanelDecisionOsoApiV17PhtPanelDecisionDecisionIdPut(
        decision.id,
        panelDecisionToPdm(decision, decision.cycle)
      ),
    (data) => panelDecisionFromPdm(data, decision.cycle)
  );
