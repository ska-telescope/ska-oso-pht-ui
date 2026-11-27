import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { Panel as PanelPDM } from '@/generated/models';
import { Panel } from '@utils/types/panel.tsx';
import { panelToPdm } from '@/models/panels/panels';
import { UNKNOWN_API_ERROR } from './apiResult';
import { assignToPanels, generatePanels, listPanels, updatePanel } from './panels';

// The error handling common to every call is tested with callApi (apiResult.test.tsx), and the
// mapping with the panel mappers (models/panels). These tests cover what each call sends and
// how it reads the response.

const { mockList, mockUpdate, mockGenerate, mockAssign } = vi.hoisted(() => ({
  mockList: vi.fn(),
  mockUpdate: vi.fn(),
  mockGenerate: vi.fn(),
  mockAssign: vi.fn()
}));

vi.mock('./client', () => ({
  osoApiBasePath: '',
  api: {
    panels: {
      getPanelsOsoApiV17PhtPanelsGet: mockList,
      updatePanelOsoApiV17PhtPanelsPanelIdPut: mockUpdate,
      autoCreatePanelOsoApiV17PhtPanelsGeneratePost: mockGenerate,
      autoAssignToPanelOsoApiV17PhtPanelsAssignmentsPost: mockAssign
    }
  }
}));

const pdm: PanelPDM = {
  panel_id: 'panel-1',
  name: 'Stargazers',
  proposals: [{ prsl_id: 'prsl-1', assigned_on: '2025-07-04T09:30:00Z' }],
  sci_reviewers: [],
  tech_reviewers: []
};

const panel: Panel = {
  id: 'panel-1',
  name: 'Stargazers',
  proposals: [{ panelId: 'panel-1', proposalId: 'prsl-1', assignedOn: '2025-07-04T09:30:00Z' }],
  sciReviewers: [],
  tecReviewers: []
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe('listPanels', () => {
  test('returns the panels mapped from the PDM', async () => {
    mockList.mockResolvedValue({ data: [pdm] });
    await expect(listPanels()).resolves.toEqual({ data: [expect.objectContaining(panel)] });
  });

  test('returns the standard error when the response is not a list', async () => {
    mockList.mockResolvedValue({ data: { not: 'a list' } });
    await expect(listPanels()).resolves.toEqual({ error: UNKNOWN_API_ERROR });
  });
});

describe('updatePanel', () => {
  test('sends the panel as PDM in the given cycle and returns the panel as stored', async () => {
    mockUpdate.mockResolvedValue({ data: pdm });

    await expect(updatePanel(panel, 'cycle-1')).resolves.toEqual({
      data: expect.objectContaining(panel)
    });
    expect(mockUpdate).toHaveBeenCalledExactlyOnceWith('panel-1', panelToPdm(panel, 'cycle-1'));
  });

  test('returns the error from a failed save', async () => {
    mockUpdate.mockRejectedValue(new Error('Network Error'));
    await expect(updatePanel(panel, 'cycle-1')).resolves.toEqual({ error: 'Network Error' });
  });
});

describe('generatePanels', () => {
  test('returns what the ODA created', async () => {
    const created = { created_count: 1, created_names: ['Stargazers'] };
    mockGenerate.mockResolvedValue({ data: created });
    await expect(generatePanels()).resolves.toEqual({ data: created });
  });
});

describe('assignToPanels', () => {
  test('sends the cycle description', async () => {
    mockAssign.mockResolvedValue({ data: {} });
    await assignToPanels('Cycle 1');
    expect(mockAssign).toHaveBeenCalledExactlyOnceWith('Cycle 1');
  });
});
