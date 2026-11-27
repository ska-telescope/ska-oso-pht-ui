import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { PanelDecision as PanelDecisionPDM } from '@/generated/models';
import { PanelDecision } from '@utils/types/panelDecision.tsx';
import { panelDecisionToPdm } from '@/models/panels/panelDecisions';
import { UNKNOWN_API_ERROR } from './apiResult';
import { listPanelDecisions, updatePanelDecision } from './panelDecisions';

// The error handling common to every call is tested with callApi (apiResult.test.tsx), and the
// mapping with the decision mappers (models/panels).

const { mockList, mockUpdate } = vi.hoisted(() => ({
  mockList: vi.fn(),
  mockUpdate: vi.fn()
}));

vi.mock('./client', () => ({
  osoApiBasePath: '',
  api: {
    panelDecisions: {
      getPanelDecisionsForUserOsoApiV17PhtPanelDecisionGet: mockList,
      updatePanelDecisionOsoApiV17PhtPanelDecisionDecisionIdPut: mockUpdate
    }
  }
}));

const pdm: PanelDecisionPDM = {
  decision_id: 'decision-1',
  panel_id: 'panel-1',
  prsl_id: 'prsl-1',
  rank: 1,
  recommendation: 'Accepted',
  status: 'Decided'
};

const decision: PanelDecision = {
  id: 'decision-1',
  cycle: 'cycle-1',
  panelId: 'panel-1',
  proposalId: 'prsl-1',
  rank: 1,
  recommendation: 'Accepted',
  status: 'Decided'
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe('listPanelDecisions', () => {
  test('returns the decisions mapped from the PDM, in the given cycle', async () => {
    mockList.mockResolvedValue({ data: [pdm] });
    await expect(listPanelDecisions('cycle-1')).resolves.toEqual({ data: [decision] });
  });

  test('returns the standard error when the response is not a list', async () => {
    mockList.mockResolvedValue({ data: 'not a list' });
    await expect(listPanelDecisions('cycle-1')).resolves.toEqual({ error: UNKNOWN_API_ERROR });
  });
});

describe('updatePanelDecision', () => {
  test('sends the decision as PDM and returns it as stored', async () => {
    mockUpdate.mockResolvedValue({ data: pdm });

    await expect(updatePanelDecision(decision)).resolves.toEqual({ data: decision });
    expect(mockUpdate).toHaveBeenCalledExactlyOnceWith(
      'decision-1',
      panelDecisionToPdm(decision, 'cycle-1')
    );
  });

  test('returns the error from a failed save', async () => {
    mockUpdate.mockRejectedValue(new Error('Network Error'));
    await expect(updatePanelDecision(decision)).resolves.toEqual({ error: 'Network Error' });
  });
});
