import { PanelBackend } from '@/utils/types/panel';

export const MockPanelBackend: PanelBackend = {
  panel_id: 'panel-12345',
  name: 'string',
  cycle: 'string',
  proposals: [],
  sci_reviewers: [],
  tech_reviewers: []
};

export const MockPanelBackendWithProposals: PanelBackend = {
  panel_id: 'panel-12345',
  name: 'string',
  cycle: 'string',
  proposals: [
    {
      prsl_id: 'prsl-t0001-20250704-00002',
      assigned_on: '2025-07-04T11:48:38.435000Z'
    }
  ],
  sci_reviewers: [],
  tech_reviewers: []
};

export const MockPanelBackendWithReviewers: PanelBackend = {
  panel_id: 'panel-12345',
  name: 'string',
  cycle: 'string',
  proposals: [],
  sci_reviewers: [
    {
      reviewer_id: 'c8f8f18a-3c70-4c39-8ed9-2d8d180d99a1',
      assigned_on: '2025-07-03T16:20:37.088Z',
      status: 'pending'
    }
  ],
  tech_reviewers: []
};
