import { afterEach, describe, expect, test, vi } from 'vitest';
import { Metadata } from '@utils/types/metadata.tsx';
import type { Panel as PanelPDM } from '@/generated/models';
import { Panel } from '@utils/types/panel.tsx';
import { panelFromPdm, panelsFromPdm, panelToPdm } from './panels';

const metadata = (lastModifiedOn: string) => ({
  version: 1,
  created_by: 'user1',
  created_on: '2025-07-01T00:00:00Z',
  last_modified_by: 'user1',
  last_modified_on: lastModifiedOn,
  pdm_version: '18.2.0'
});

const pdm: PanelPDM = {
  metadata: metadata('2025-07-04T00:00:00Z'),
  panel_id: 'panel-1',
  name: 'Stargazers',
  cycle: 'cycle-1',
  expiry_date: '2025-09-01T00:00:00Z',
  proposals: [{ prsl_id: 'prsl-1', assigned_on: '2025-07-04T09:30:00Z' }],
  sci_reviewers: [{ reviewer_id: 'rev-1', assigned_on: '2025-07-04T09:30:00Z', status: 'Pending' }],
  tech_reviewers: [
    { reviewer_id: 'rev-2', assigned_on: '2025-07-04T09:30:00Z', status: 'Accepted' }
  ]
};

const panel: Panel = {
  id: 'panel-1',
  metadata: pdm.metadata as Metadata,
  name: 'Stargazers',
  expiresOn: '2025-09-01T00:00:00Z',
  proposals: [{ panelId: 'panel-1', proposalId: 'prsl-1', assignedOn: '2025-07-04T09:30:00Z' }],
  sciReviewers: [
    {
      panelId: 'panel-1',
      reviewerId: 'rev-1',
      assignedOn: '2025-07-04T09:30:00Z',
      status: 'Pending'
    }
  ],
  tecReviewers: [
    {
      panelId: 'panel-1',
      reviewerId: 'rev-2',
      assignedOn: '2025-07-04T09:30:00Z',
      status: 'Accepted'
    }
  ]
};

afterEach(() => {
  vi.useRealTimers();
});

describe('panelFromPdm', () => {
  test('maps the panel and its assignments, leaving out its cycle', () => {
    expect(panelFromPdm(pdm)).toEqual(panel);
  });

  test('gives empty assignments when the PDM has none', () => {
    const bare: PanelPDM = { panel_id: 'panel-1', name: 'Stargazers' };
    expect(panelFromPdm(bare)).toMatchObject({
      proposals: [],
      sciReviewers: [],
      tecReviewers: []
    });
  });
});

describe('panelsFromPdm', () => {
  test('keeps only the latest version of each panel', () => {
    const older = { ...pdm, name: 'Old name', metadata: metadata('2025-07-01T00:00:00Z') };
    const other = { ...pdm, panel_id: 'panel-2', metadata: metadata('2025-07-02T00:00:00Z') };

    const panels = panelsFromPdm([older, pdm, other]);

    expect(panels.map((p) => [p.id, p.name])).toEqual(
      expect.arrayContaining([
        ['panel-1', 'Stargazers'],
        ['panel-2', 'Stargazers']
      ])
    );
    expect(panels).toHaveLength(2);
  });
});

describe('panelToPdm', () => {
  test('maps the panel back, in the given cycle when it has none of its own', () => {
    expect(panelToPdm(panel, 'cycle-1')).toEqual({ ...pdm, metadata: undefined });
  });

  test("keeps the panel's own cycle", () => {
    expect(panelToPdm({ ...panel, cycle: 'cycle-own' }, 'cycle-1').cycle).toBe('cycle-own');
  });

  test('assigns a new proposal or reviewer now', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    const now = new Date().toISOString();

    const result = panelToPdm(
      {
        ...panel,
        proposals: [{ panelId: 'panel-1', proposalId: 'prsl-2' }],
        sciReviewers: [{ panelId: 'panel-1', reviewerId: 'rev-3', status: 'Pending' }],
        tecReviewers: []
      },
      'cycle-1'
    );

    expect(result.proposals).toEqual([{ prsl_id: 'prsl-2', assigned_on: now }]);
    expect(result.sci_reviewers).toEqual([
      { reviewer_id: 'rev-3', assigned_on: now, status: 'Pending' }
    ]);
  });
});
