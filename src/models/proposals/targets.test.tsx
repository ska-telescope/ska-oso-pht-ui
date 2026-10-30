import { describe, expect, expectTypeOf, test } from 'vitest';
import { mapping } from '@services/axios/get/getProposal/getProposal';
import {
  MockProposalBackend,
  MockProposalBackendZoom
} from '@services/axios/get/getProposal/mockProposalBackend.tsx';
import MappingPutProposal from '@services/axios/put/putProposal/putProposalMapping';
import { ProposalBackend } from '@utils/types/proposal.tsx';
import Target from '@utils/types/target';
import { PROPOSAL_STATUS } from '@utils/constants.ts';
import { getTargetsSchema, TargetsType, targetsFromPdm, targetsToPdm } from './targets';

const mockPdms = [
  ['MockProposalBackend', MockProposalBackend as unknown as ProposalBackend],
  ['MockProposalBackendZoom', MockProposalBackendZoom as unknown as ProposalBackend]
] as const;

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

describe('targets PDM mapping', () => {
  test.each(mockPdms)('maps %s the same as the legacy mappers', (_, pdm) => {
    const legacy = mapping(pdm);
    const targets = targetsFromPdm(pdm.observation_info?.targets);

    expect(targets).toEqual(legacy.targets);
    expect(targetsToPdm(targets)).toEqual(
      MappingPutProposal(legacy, PROPOSAL_STATUS.DRAFT).observation_info.targets
    );
  });

  test.each(mockPdms)('round-trips %s through the form without further change', (_, pdm) => {
    const saved = targetsToPdm(targetsFromPdm(pdm.observation_info?.targets));
    expect(targetsToPdm(targetsFromPdm(saved))).toEqual(saved);
  });

  test('reads missing targets as an empty list', () => {
    expect(targetsFromPdm(undefined)).toEqual([]);
  });
});
