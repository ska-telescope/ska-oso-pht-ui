import { PANEL_DECISION_STATUS } from '@utils/constants.ts';
import { PanelDecision } from '@utils/types/panelDecision.tsx';

export const MockPanelDecisionFrontendList: PanelDecision[] = [
  {
    id: 'PANEL-DECISION-ID-001',
    cycle: 'CYCLE-001',
    metaData: undefined,
    panelId: 'PANEL-ID-001',
    proposalId: 'PROPOSAL-ID-001',
    rank: 1,
    recommendation: 'Recommendation 1',
    decidedBy: 'user1',
    decidedOn: '2023-01-02T00:00:00Z',
    status: PANEL_DECISION_STATUS.TO_DO
  },
  {
    id: 'PANEL-DECISION-ID-002',
    cycle: 'CYCLE-001',
    panelId: 'PANEL-ID-001',
    proposalId: 'PROPOSAL-ID-001',
    rank: 1,
    recommendation: 'Recommendation 2',
    decidedBy: 'user1',
    decidedOn: '2023-01-02T00:00:00Z',
    status: PANEL_DECISION_STATUS.REVIEWED,
    metaData: undefined
  },
  {
    id: 'PANEL-DECISION-ID-003',
    cycle: 'CYCLE-001',
    panelId: 'PANEL-ID-001',
    proposalId: 'PROPOSAL-ID-001',
    rank: 1,
    recommendation: 'Recommendation 3',
    decidedBy: 'user1',
    decidedOn: '2023-01-02T00:00:00Z',
    status: PANEL_DECISION_STATUS.REVIEWED,
    metaData: undefined
  }
];
