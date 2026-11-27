import { describe, expect, test } from 'vitest';
import { Metadata } from '@utils/types/metadata.tsx';
import type { PanelDecision as PanelDecisionPDM } from '@/generated/models';
import { PanelDecision } from '@utils/types/panelDecision.tsx';
import { PANEL_DECISION_STATUS } from '@utils/constants.ts';
import { panelDecisionFromPdm, panelDecisionsFromPdm, panelDecisionToPdm } from './panelDecisions';

const metadata = (lastModifiedOn: string) => ({
  version: 1,
  created_by: 'user1',
  created_on: '2025-07-01T00:00:00Z',
  last_modified_by: 'user1',
  last_modified_on: lastModifiedOn,
  pdm_version: '18.2.0'
});

const pdm: PanelDecisionPDM = {
  metadata: metadata('2025-07-04T00:00:00Z'),
  decision_id: 'decision-1',
  cycle: 'cycle-1',
  panel_id: 'panel-1',
  prsl_id: 'prsl-1',
  rank: 2,
  recommendation: 'Accepted',
  status: 'Decided'
};

const decision: PanelDecision = {
  metaData: pdm.metadata as Metadata,
  id: 'decision-1',
  cycle: 'cycle-1',
  panelId: 'panel-1',
  proposalId: 'prsl-1',
  rank: 2,
  recommendation: 'Accepted',
  status: PANEL_DECISION_STATUS.DECIDED
};

describe('panelDecisionFromPdm', () => {
  test('maps the decision', () => {
    expect(panelDecisionFromPdm(pdm, 'cycle-other')).toEqual(decision);
  });

  test('gives the decision the given cycle when it has none of its own', () => {
    expect(panelDecisionFromPdm({ ...pdm, cycle: null }, 'cycle-2').cycle).toBe('cycle-2');
  });
});

describe('panelDecisionsFromPdm', () => {
  test('keeps only the latest version of each decision', () => {
    const older = { ...pdm, rank: 9, metadata: metadata('2025-07-01T00:00:00Z') };
    const other = { ...pdm, decision_id: 'decision-2', metadata: metadata('2025-07-02T00:00:00Z') };

    const decisions = panelDecisionsFromPdm([older, pdm, other], 'cycle-1');

    expect(decisions).toHaveLength(2);
    expect(decisions.find((d) => d.id === 'decision-1')?.rank).toBe(2);
  });
});

describe('panelDecisionToPdm', () => {
  test('maps the decision back, without its metadata', () => {
    expect(panelDecisionToPdm(decision, 'cycle-other')).toEqual({ ...pdm, metadata: undefined });
  });

  test('gives the decision the given cycle when it has none of its own', () => {
    expect(panelDecisionToPdm({ ...decision, cycle: '' }, 'cycle-2').cycle).toBe('cycle-2');
  });
});
