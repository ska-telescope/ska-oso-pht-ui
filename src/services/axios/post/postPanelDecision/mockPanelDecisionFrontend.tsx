import { PANEL_DECISION_STATUS } from '@utils/constants.ts';
import { PanelDecision } from '@utils/types/panelDecision.tsx';

export const MockPanelDecisionFrontend: PanelDecision = {
  id: 'PANEL-DECISION-ID-001',
  cycle: 'CYCLE-001',
  metaData: undefined,
  panelId: 'PANEL-ID-001',
  proposalId: 'PROPOSAL-ID-001',
  rank: 1,
  recommendation: 'This proposal is recommended for selection.',
  decidedBy: 'user1',
  decidedOn: '2023-01-02T00:00:00Z',
  status: PANEL_DECISION_STATUS.TO_DO
};
