import { describe, expect, expectTypeOf, test } from 'vitest';
import { mapping } from '@services/axios/get/getProposal/getProposal';
import {
  MockProposalBackend,
  MockProposalBackendZoom
} from '@services/axios/get/getProposal/mockProposalBackend.tsx';
import { ProposalBackend } from '@utils/types/proposal.tsx';
import TargetObservation from '@utils/types/targetObservation';
import { getTargetObservationSchema, TargetObservationType } from './targetObservation';

const link = { targetId: 't1', observationId: 'obs1', dataProductsSDPId: 'sdp1' };

describe('target observation schema', () => {
  const schema = getTargetObservationSchema();

  test.each([
    ['MockProposalBackend', MockProposalBackend],
    ['MockProposalBackendZoom', MockProposalBackendZoom]
  ])('accepts the links the legacy mapper loads from %s', (_, pdm) => {
    const { targetObservation } = mapping(pdm as unknown as ProposalBackend);
    expect(targetObservation).not.toHaveLength(0);
    expect(schema.safeParse(targetObservation).error).toBeUndefined();
  });

  test('accepts a link without sensitivity results', () => {
    expect(schema.safeParse([link]).success).toBe(true);
  });

  test('rejects a link without a target', () => {
    const { targetId: _, ...noTarget } = link;
    expect(schema.safeParse([noTarget]).success).toBe(false);
  });

  test('rejects an unknown sensitivity status', () => {
    expect(schema.safeParse([{ ...link, sensCalc: { statusGUI: 2 } }]).success).toBe(false);
  });

  test('legacy links can seed the form', () => {
    expectTypeOf<TargetObservation[]>().toExtend<TargetObservationType>();
  });
});
