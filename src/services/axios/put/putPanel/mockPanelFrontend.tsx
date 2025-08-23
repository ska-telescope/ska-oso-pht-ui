import { Panel } from '@/utils/types/panel';

export const MockPanelFrontend: Panel = {
  metadata: {
    version: 1,
    created_by: 'string',
    created_on: '2025-07-03T16:20:37.088Z',
    last_modified_by: 'string',
    last_modified_on: '2025-07-03T16:20:37.088Z',
    pdm_version: '18.2.0'
  },
  id: 'panel-12345',
  name: 'string',
  cycle: 'string',
  proposals: [],
  sciReviewers: [],
  tecReviewers: []
};

export const MockPanelFrontendWithProposals: Panel = {
  metadata: {
    version: 1,
    created_by: 'string',
    created_on: '2025-07-03T16:20:37.088Z',
    last_modified_by: 'string',
    last_modified_on: '2025-07-03T16:20:37.088Z',
    pdm_version: '18.2.0'
  },
  id: 'panel-12345',
  name: 'string',
  cycle: 'string',
  proposals: [
    {
      proposalId: 'prsl-t0001-20250704-00002',
      panelId: 'panel-12345',
      assignedOn: '2025-07-04T11:48:38.435000Z'
    }
  ],
  sciReviewers: [],
  tecReviewers: []
};

export const MockPanelFrontendWithReviewers: Panel = {
  metadata: {
    version: 1,
    created_by: 'string',
    created_on: '2025-07-03T16:20:37.088Z',
    last_modified_by: 'string',
    last_modified_on: '2025-07-03T16:20:37.088Z',
    pdm_version: '18.2.0'
  },
  id: 'panel-12345',
  name: 'string',
  cycle: 'string',
  proposals: [],
  sciReviewers: [
    {
      reviewerId: 'c8f8f18a-3c70-4c39-8ed9-2d8d180d99a1',
      panelId: 'panel-12345',
      assignedOn: '2025-07-03T16:20:37.088Z',
      status: 'pending'
    }
  ],
  tecReviewers: []
};
