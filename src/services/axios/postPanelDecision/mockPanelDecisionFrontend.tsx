import { PanelDecision } from '@/utils/types/panelDecision';

export const mockPanelDecisionFrontend: PanelDecision = {
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
  recommendation: 'This proposal is recommended for selection.',
  decidedBy: 'user1',
  decidedOn: '2023-01-02T00:00:00Z',
  status: 'To Do'
};
