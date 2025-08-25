import { Panel } from '@utils/types/panel.tsx';

export const MockPanelFrontendList: Panel[] = [
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
    sciReviewers: [],
    tecReviewers: []
  },
  {
    id: 'panel-t0001-20250702-00002',
    metadata: {
      version: 1,
      created_by: 'user1',
      created_on: '2025-07-03T16:20:37.088Z',
      last_modified_by: 'user1',
      last_modified_on: '2025-07-03T16:20:37.088Z',
      pdm_version: '18.2.0'
    },
    name: 'Buttons',
    expiresOn: undefined,
    proposals: [],
    sciReviewers: [],
    tecReviewers: []
  },
  {
    id: 'panel-t0001-20250704-00003',
    metadata: {
      version: 1,
      created_by: 'user1',
      created_on: '2025-07-01T16:20:37.088Z',
      last_modified_by: 'user1',
      last_modified_on: '2025-07-01T16:20:37.088Z',
      pdm_version: '18.2.0'
    },
    name: 'Nashrakra',
    expiresOn: undefined,
    proposals: [],
    sciReviewers: [],
    tecReviewers: []
  },
  {
    metadata: {
      version: 1,
      created_by: 'user1',
      created_on: '2025-02-03T16:20:37.088Z',
      last_modified_by: 'user1',
      last_modified_on: '2025-02-04T16:20:37.088Z',
      pdm_version: '18.2.0'
    },
    id: 'panel-t0001-20250704-00004',
    name: 'Fusion',
    expiresOn: undefined,
    proposals: [],
    sciReviewers: [
      {
        panelId: 'panel-t0001-20250704-00004',
        reviewerId: 'prsl-t0001-20250704-00001',
        assignedOn: '2025-02-04T09:30:00Z',
        status: 'pending'
      },
      {
        panelId: 'panel-t0001-20250704-00004',
        reviewerId: 'prsl-t0001-20250704-00002',
        assignedOn: '2025-02-04T09:30:00Z',
        status: 'pending'
      }
    ],
    tecReviewers: []
  }
];
