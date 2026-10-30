import { describe, expect, expectTypeOf, test } from 'vitest';
import { mapping } from '@services/axios/get/getProposal/getProposal';
import {
  MockProposalBackend,
  MockProposalBackendZoom
} from '@services/axios/get/getProposal/mockProposalBackend.tsx';
import { ProposalBackend } from '@utils/types/proposal.tsx';
import { CalibrationStrategy } from '@utils/types/calibrationStrategy';
import { CalibrationStrategyType, getCalibrationStrategySchema } from './calibrationStrategy';

const strategy = {
  observatoryDefined: true,
  id: 'cal1',
  observationIdRef: 'obs1',
  calibrators: [
    {
      targetId: '',
      name: '3C286',
      calibrationIntent: 'flux',
      durationSeconds: 600,
      selectionStrategy: 'highest_elevation',
      relativeToScan: 'before_each_scan',
      notes: null
    }
  ],
  notes: null
};

describe('calibration strategy schema', () => {
  const schema = getCalibrationStrategySchema();

  test.each([
    ['MockProposalBackend', MockProposalBackend],
    ['MockProposalBackendZoom', MockProposalBackendZoom]
  ])('accepts the calibration the legacy mapper loads from %s', (_, pdm) => {
    const { calibrationStrategy } = mapping(pdm as unknown as ProposalBackend);
    expect(calibrationStrategy).not.toHaveLength(0);
    expect(schema.safeParse(calibrationStrategy).error).toBeUndefined();
  });

  test('accepts an observatory defined strategy', () => {
    expect(schema.safeParse([strategy]).success).toBe(true);
  });

  test('accepts a strategy without calibrators', () => {
    expect(schema.safeParse([{ ...strategy, calibrators: null }]).success).toBe(true);
  });

  test('rejects an unknown selection strategy', () => {
    const calibrators = [{ ...strategy.calibrators[0], selectionStrategy: 'random' }];
    expect(schema.safeParse([{ ...strategy, calibrators }]).success).toBe(false);
  });

  test('legacy calibration can seed the form', () => {
    expectTypeOf<CalibrationStrategy[]>().toExtend<CalibrationStrategyType>();
  });
});
