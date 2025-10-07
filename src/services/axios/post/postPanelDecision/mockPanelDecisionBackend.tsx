import { PANEL_DECISION_STATUS } from '@utils/constants.ts';
import { PanelDecisionBackend } from '@utils/types/panelDecision.tsx';

export const MockPanelDecisionBackend: PanelDecisionBackend = {
  decision_id: 'PANEL-DECISION-ID-001',
  cycle: 'CYCLE-001',
  panel_id: 'PANEL-ID-001',
  prsl_id: 'PROPOSAL-ID-001',
  rank: 1,
  recommendation: 'This proposal is recommended for selection.',
  decided_by: 'user1',
  decided_on: '2023-01-02T00:00:00Z',
  status: PANEL_DECISION_STATUS.TO_DO
};
