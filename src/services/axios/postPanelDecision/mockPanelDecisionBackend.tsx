import { PanelDecisionBackend } from '@/utils/types/panelDecision';

export const mockPanelDecisionBackend: PanelDecisionBackend = {
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
  recommendation: 'This proposal is recommended for selection.',
  decided_by: 'user1',
  decided_on: '2023-01-02T00:00:00Z',
  status: 'To Do'
};
