import { PANEL_DECISION_STATUS } from '@/utils/constants';
import { PanelDecision } from '@/utils/types/panelDecision';

export const MockPanelDecisionFrontendList: PanelDecision[] = [
  {
    metaData: {
      version: 1,
      created_by: 'user1',
      created_on: '2023-01-01T00:00:00Z',
      last_modified_by: 'user1',
      last_modified_on: '2023-01-02T00:00:00Z',
      pdm_version: '18.2.0'
    },
    id: 'PANEL-DECISION-ID-001',
    cycle: 'CYCLE-001',
    panelId: 'PANEL-ID-001',
    proposalId: 'PROPOSAL-ID-001',
    rank: 1,
    recommendation: 'Recommendation 1',
    decidedBy: 'user1',
    decidedOn: '2023-01-02T00:00:00Z',
    status: PANEL_DECISION_STATUS.TO_DO
  },
  {
    metaData: {
      version: 1,
      created_by: 'user1',
      created_on: '2023-01-01T00:00:00Z',
      last_modified_by: 'user1',
      last_modified_on: '2023-01-02T00:00:00Z',
      pdm_version: '18.2.0'
    },
    id: 'PANEL-DECISION-ID-002',
    cycle: 'CYCLE-001',
    panelId: 'PANEL-ID-001',
    proposalId: 'PROPOSAL-ID-001',
    rank: 1,
    recommendation: 'Recommendation 2',
    decidedBy: 'user1',
    decidedOn: '2023-01-02T00:00:00Z',
    status: PANEL_DECISION_STATUS.DECIDED
  },
  {
    metaData: {
      version: 1,
      created_by: 'user1',
      created_on: '2023-01-01T00:00:00Z',
      last_modified_by: 'user1',
      last_modified_on: '2023-01-02T00:00:00Z',
      pdm_version: '18.2.0'
    },
    id: 'PANEL-DECISION-ID-003',
    cycle: 'CYCLE-001',
    panelId: 'PANEL-ID-001',
    proposalId: 'PROPOSAL-ID-001',
    rank: 1,
    recommendation: 'Recommendation 3',
    decidedBy: 'user1',
    decidedOn: '2023-01-02T00:00:00Z',
    status: PANEL_DECISION_STATUS.DECIDED
  }
];
