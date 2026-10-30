import { describe, expect, expectTypeOf, test } from 'vitest';
import { mapping } from '@services/axios/get/getProposal/getProposal';
import {
  MockProposalBackend,
  MockProposalBackendZoom
} from '@services/axios/get/getProposal/mockProposalBackend.tsx';
import MappingPutProposal from '@services/axios/put/putProposal/putProposalMapping';
import { ProposalBackend } from '@utils/types/proposal.tsx';
import { CalibrationStrategy } from '@utils/types/calibrationStrategy';
import { PROPOSAL_STATUS } from '@utils/constants.ts';
import {
  CalibrationStrategyType,
  calibrationStrategyFromPdm,
  calibrationStrategyToPdm,
  getCalibrationStrategySchema
} from './calibrationStrategy';

const mockPdms = [
  ['MockProposalBackend', MockProposalBackend as unknown as ProposalBackend],
  ['MockProposalBackendZoom', MockProposalBackendZoom as unknown as ProposalBackend]
] as const;

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

describe('calibration strategy PDM mapping', () => {
  test.each(mockPdms)('maps %s the same as the legacy mappers', (_, pdm) => {
    const legacy = mapping(pdm);
    const calibration = calibrationStrategyFromPdm(pdm.observation_info?.calibration_strategy);

    expect(calibration).toEqual(legacy.calibrationStrategy);
    expect(calibrationStrategyToPdm(calibration)).toEqual(
      MappingPutProposal(legacy, PROPOSAL_STATUS.DRAFT).observation_info.calibration_strategy
    );
  });

  test.each(mockPdms)('round-trips %s through the form unchanged', (_, pdm) => {
    const strategies = pdm.observation_info?.calibration_strategy;
    expect(calibrationStrategyToPdm(calibrationStrategyFromPdm(strategies))).toEqual(strategies);
  });

  test('reads missing calibration as an empty list', () => {
    expect(calibrationStrategyFromPdm(null)).toEqual([]);
  });
});
