import { PanelBackend } from '@/utils/types/panel';

export const MockPanelBackend: PanelBackend = {
  metadata: {
    version: 1,
    created_by: 'string',
    created_on: '2025-07-03T16:20:37.088Z',
    last_modified_by: 'string',
    last_modified_on: '2025-07-03T16:20:37.088Z',
    pdm_version: '18.2.0'
  },
  panel_id: 'panel-12345',
  name: 'string',
  cycle: 'string',
  proposals: [],
  reviewers: []
};

export const MockPanelBackendWithProposals: PanelBackend = {
  metadata: {
    version: 1,
    created_by: 'string',
    created_on: '2025-07-03T16:20:37.088Z',
    last_modified_by: 'string',
    last_modified_on: '2025-07-03T16:20:37.088Z',
    pdm_version: '18.2.0'
  },
  panel_id: 'panel-12345',
  name: 'string',
  cycle: 'string',
  proposals: [
    {
      prsl_id: 'prsl-t0001-20250704-00002',
      assigned_on: '2025-07-04T11:48:38.435000Z'
    }
  ],
  reviewers: []
};

export const MockPanelBackendWithReviewers: PanelBackend = {
  metadata: {
    version: 1,
    created_by: 'string',
    created_on: '2025-07-03T16:20:37.088Z',
    last_modified_by: 'string',
    last_modified_on: '2025-07-03T16:20:37.088Z',
    pdm_version: '18.2.0'
  },
  panel_id: 'panel-12345',
  name: 'string',
  cycle: 'string',
  proposals: [],
  reviewers: [
    {
      reviewer_id: 'c8f8f18a-3c70-4c39-8ed9-2d8d180d99a1',
      assigned_on: '2025-07-03T16:20:37.088Z',
      status: 'pending'
    }
  ]
};
