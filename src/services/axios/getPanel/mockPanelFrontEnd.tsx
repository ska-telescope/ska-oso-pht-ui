import { Panel } from '@/utils/types/panel';

export const MockPanelFrontend: Panel =
  {
    id: 'panel-t0001-20250704-00001',
    metadata: {
      version: 1,
      created_by: 'user1',
      created_on: '2025-07-03T16:20:37.088Z',
      last_modified_by: 'user1',
      last_modified_on: '2025-07-04T16:20:37.088Z',
      pdm_version: '18.2.0'
    },
    name: 'Stargazers',
    expiresOn: undefined,
    proposals: [
      {
        panelId: 'panel-t0001-20250704-00001',
        proposalId: 'prsl-t0001-20250704-00001',
        assignedOn: '2025-07-04T09:30:00Z'
      },
      {
        panelId: 'panel-t0001-20250704-00001',
        proposalId: 'prsl-t0001-20250704-00002',
        assignedOn: '2025-07-04T09:30:00Z'
      }
    ],
    reviewers: [
      {
        panelId: 'panel-t0001-20250704-00001',
        reviewerId: 'prsl-t0001-20250704-00001',
        assignedOn: '2025-02-04T09:30:00Z',
        status: 'pending'
      },
      {
        panelId: 'panel-t0001-20250704-00001',
        reviewerId: 'prsl-t0001-20250704-00002',
        assignedOn: '2025-02-04T09:30:00Z',
        status: 'pending'
      }
    ]
  };
