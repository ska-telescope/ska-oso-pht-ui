import { PanelBackend } from '@/utils/types/panel';

export const MockPanelBackend: PanelBackend = {
  metadata: {
    version: 1,
    created_by: 'user1',
    created_on: '2025-07-03T16:20:37.088Z',
    last_modified_by: 'user1',
    last_modified_on: '2025-07-04T16:20:37.088Z',
    pdm_version: '18.2.0'
  },
  panel_id: 'panel-t0001-20250704-00001',
  name: 'Stargazers',
  cycle: 'cycle-0001',
  proposals: [
    {
      prsl_id: 'prsl-t0001-20250704-00001',
      assigned_on: '2025-07-04T09:30:00Z'
    },
    {
      prsl_id: 'prsl-t0001-20250704-00002',
      assigned_on: '2025-07-04T09:30:00Z'
    }
  ],
  reviewers: [
    {
      reviewer_id: 'prsl-t0001-20250704-00001',
      assigned_on: '2025-02-04T09:30:00Z',
      status: 'pending'
    },
    {
      reviewer_id: 'prsl-t0001-20250704-00002',
      assigned_on: '2025-02-04T09:30:00Z',
      status: 'pending'
    }
  ]
};
