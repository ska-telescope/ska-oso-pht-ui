import { describe, expect, expectTypeOf, test } from 'vitest';
import { mapping } from '@services/axios/get/getProposal/getProposal';
import {
  MockProposalBackend,
  MockProposalBackendZoom
} from '@services/axios/get/getProposal/mockProposalBackend.tsx';
import { ProposalBackend } from '@utils/types/proposal.tsx';
import Target from '@utils/types/target';
import { getTargetsSchema, TargetsType } from './targets';

describe('targets schema', () => {
  const schema = getTargetsSchema();

  test.each([
    ['MockProposalBackend', MockProposalBackend],
    ['MockProposalBackendZoom', MockProposalBackendZoom]
  ])('accepts the targets the legacy mapper loads from %s', (_, pdm) => {
    const { targets } = mapping(pdm as unknown as ProposalBackend);
    expect(targets).not.toHaveLength(0);
    expect(schema.safeParse(targets).error).toBeUndefined();
  });

  test('accepts a proposal with no targets', () => {
    expect(schema.safeParse([]).success).toBe(true);
  });

  test('rejects a target without an id', () => {
    expect(schema.safeParse([{ name: 'M2', kind: 0 }]).success).toBe(false);
  });

  test('legacy targets can seed the form', () => {
    expectTypeOf<Target[]>().toExtend<TargetsType>();
  });
});
