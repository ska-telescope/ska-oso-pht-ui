import { PANEL_DECISION_STATUS } from '@utils/constants.ts';
import { PanelDecisionBackend } from '@utils/types/panelDecision.tsx';

export const MockPanelDecisionBackendList: PanelDecisionBackend[] = [
  {
    metaData: {
      version: 1,
      created_by: 'user1',
      created_on: '2023-01-01T00:00:00Z',
      last_modified_by: 'user1',
      last_modified_on: '2023-01-02T00:00:00Z',
      pdm_version: '18.2.0'
    },
    decision_id: 'PANEL-DECISION-ID-001',
    cycle: 'CYCLE-001',
    panel_id: 'PANEL-ID-001',
    prsl_id: 'PROPOSAL-ID-001',
    rank: 1,
    recommendation: 'Recommendation 1',
    decided_by: 'user1',
    decided_on: '2023-01-02T00:00:00Z',
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
    decision_id: 'PANEL-DECISION-ID-002',
    cycle: 'CYCLE-001',
    panel_id: 'PANEL-ID-001',
    prsl_id: 'PROPOSAL-ID-001',
    rank: 1,
    recommendation: 'Recommendation 2',
    decided_by: 'user1',
    decided_on: '2023-01-02T00:00:00Z',
    status: PANEL_DECISION_STATUS.REVIEWED
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
    decision_id: 'PANEL-DECISION-ID-003',
    cycle: 'CYCLE-001',
    panel_id: 'PANEL-ID-001',
    prsl_id: 'PROPOSAL-ID-001',
    rank: 1,
    recommendation: 'Recommendation 3',
    decided_by: 'user1',
    decided_on: '2023-01-02T00:00:00Z',
    status: PANEL_DECISION_STATUS.REVIEWED
  }
];
