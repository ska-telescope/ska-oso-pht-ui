import { describe, expect, expectTypeOf, test } from 'vitest';
import { mapping } from '@services/axios/get/getProposal/getProposal';
import {
  MockProposalBackend,
  MockProposalBackendZoom
} from '@services/axios/get/getProposal/mockProposalBackend.tsx';
import { ProposalBackend } from '@utils/types/proposal.tsx';
import { MockSlicesPdm } from './mockSlicesPdm';
import Target from '@utils/types/target';
import { getTargetsSchema, TargetsType, targetsFromPdm, targetsToPdm } from './targets';

const mockPdms = [
  ['MockSlicesPdm', MockSlicesPdm],
  ['MockProposalBackend', MockProposalBackend as unknown as ProposalBackend],
  ['MockProposalBackendZoom', MockProposalBackendZoom as unknown as ProposalBackend]
] as const;

describe('targets schema', () => {
  const schema = getTargetsSchema();

  test.each(mockPdms)('accepts the targets the legacy mapper loads from %s', (_, pdm) => {
    const { targets } = mapping(pdm);
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
  test.each(mockPdms)('round-trips %s through the form without further change', (_, pdm) => {
    const saved = targetsToPdm(targetsFromPdm(pdm.observation_info?.targets));
    expect(targetsToPdm(targetsFromPdm(saved))).toEqual(saved);
  });

  // Saving does not give back every field that was loaded: the pointing pattern is not kept, and
  // some radial velocities are not saved as they were read
  const savedFrom = (pdm: ProposalBackend) =>
    structuredClone(pdm.observation_info.targets ?? []).map(
      ({ pointing_pattern: _, ...target }) => target
    ) as any[];

  test('saves the targets of MockSlicesPdm', () => {
    const expected = savedFrom(MockSlicesPdm);
    expected[0].radial_velocity.quantity.value = 0;
    expected[1].radial_velocity.definition = 'RADIO';
    expect(targetsToPdm(targetsFromPdm(MockSlicesPdm.observation_info.targets))).toEqual(expected);
  });

  test('saves the targets of MockProposalBackend', () => {
    const pdm = MockProposalBackend as unknown as ProposalBackend;
    expect(targetsToPdm(targetsFromPdm(pdm.observation_info.targets))).toEqual(savedFrom(pdm));
  });

  test('saves the targets of MockProposalBackendZoom', () => {
    const pdm = MockProposalBackendZoom as unknown as ProposalBackend;
    const expected = savedFrom(pdm);
    expected[0].radial_velocity.quantity.value = 0;
    expect(targetsToPdm(targetsFromPdm(pdm.observation_info.targets))).toEqual(expected);
  });

  test('reads missing targets as an empty list', () => {
    expect(targetsFromPdm(undefined)).toEqual([]);
  });
});
