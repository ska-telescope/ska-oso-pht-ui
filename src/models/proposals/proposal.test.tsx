import { describe, expect, test } from 'vitest';
import { getProposalSchema } from './proposal';
import { PROPOSAL_TYPE } from '@/utils/constants';

describe('proposal schema', () => {
  test.each(Object.values(PROPOSAL_TYPE))('accepts a valid title and type %s', (proposalType) => {
    expect(getProposalSchema().safeParse({ title: 'A valid title', proposalType }).success).toBe(
      true
    );
  });

  test.each([undefined, null, '', 'unsupported'])(
    'rejects an unselected or invalid type %s',
    (proposalType) => {
      const result = getProposalSchema().safeParse({ title: 'A valid title', proposalType });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['proposalType']);
      }
    }
  );

  test('accepts targets, links and calibration alongside the title and type', () => {
    const result = getProposalSchema().safeParse({
      title: 'A valid title',
      proposalType: PROPOSAL_TYPE.STANDARD,
      targets: [],
      targetObservation: [],
      calibrationStrategy: []
    });
    expect(result.success).toBe(true);
  });

  test('reports a malformed link under targetObservation', () => {
    const result = getProposalSchema().safeParse({
      title: 'A valid title',
      proposalType: PROPOSAL_TYPE.STANDARD,
      targetObservation: [{ targetId: 't1' }]
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path.slice(0, 2)).toEqual(['targetObservation', 0]);
  });
});
