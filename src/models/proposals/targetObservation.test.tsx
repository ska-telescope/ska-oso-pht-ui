import { describe, expect, expectTypeOf, test } from 'vitest';
import { mapping } from '@services/axios/get/getProposal/getProposal';
import {
  MockProposalBackend,
  MockProposalBackendZoom
} from '@services/axios/get/getProposal/mockProposalBackend.tsx';
import { ProposalBackend } from '@utils/types/proposal.tsx';
import { MockSlicesPdm } from './testing/mockSlicesPdm';
import TargetObservation from '@utils/types/targetObservation';
import {
  getTargetObservationSchema,
  TargetObservationType,
  targetObservationFromPdm,
  targetObservationToPdm
} from './targetObservation';

const mockPdms = [
  ['MockSlicesPdm', MockSlicesPdm],
  ['MockProposalBackend', MockProposalBackend as unknown as ProposalBackend],
  ['MockProposalBackendZoom', MockProposalBackendZoom as unknown as ProposalBackend]
] as const;

const link = { targetId: 't1', observationId: 'obs1', dataProductsSDPId: 'sdp1' };

describe('target observation schema', () => {
  const schema = getTargetObservationSchema();

  test.each(mockPdms)('accepts the links the legacy mapper loads from %s', (_, pdm) => {
    const { targetObservation } = mapping(pdm);
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
    expect(schema.safeParse([{ ...link, sensitivity: { state: 'unknown' } }]).success).toBe(
      false
    );
  });

  test('legacy links can seed the form', () => {
    expectTypeOf<TargetObservation[]>().toExtend<TargetObservationType>();
  });
});

describe('target observation PDM mapping', () => {
  test.each(mockPdms)('round-trips %s through the form without further change', (_, pdm) => {
    const sets = pdm.observation_info?.observation_sets ?? [];
    const saved = targetObservationToPdm(
      targetObservationFromPdm(pdm.observation_info?.result_details, sets)
    );
    expect(targetObservationToPdm(targetObservationFromPdm(saved, sets))).toEqual(saved);
  });

  const save = (pdm: ProposalBackend) => {
    const sets = pdm.observation_info.observation_sets ?? [];
    return targetObservationToPdm(
      targetObservationFromPdm(pdm.observation_info.result_details, sets)
    );
  };

  test('saves the results of MockSlicesPdm', () => {
    // Cloned one by one, as the fixture's results share their objects
    const expected = (MockSlicesPdm.observation_info.result_details ?? []).map((r) =>
      structuredClone(r)
    ) as any[];
    // Results for a supplied sensitivity are read as no results, so only the references are saved
    expected[1] = {
      ...expected[1],
      result: null,
      continuum_confusion_noise: null,
      spectral_confusion_noise: null,
      synthesized_beam_size: null
    };
    // A spectral line observation saves no continuum values
    expected[2].result.weighted_continuum_sensitivity = { value: 0, unit: '' };
    expected[2].result.total_continuum_sensitivity = { value: 0, unit: '' };
    expected[2].result.surface_brightness_sensitivity.continuum = 0;
    expected[2].continuum_confusion_noise = { value: 0, unit: '' };
    expected[2].synthesized_beam_size.continuum = '';
    expect(save(MockSlicesPdm)).toEqual(expected);
  });

  test('saves the results of MockProposalBackend', () => {
    const pdm = MockProposalBackend as unknown as ProposalBackend;
    expect(save(pdm)).toEqual(pdm.observation_info.result_details);
  });

  test('saves the results of MockProposalBackendZoom', () => {
    const pdm = MockProposalBackendZoom as unknown as ProposalBackend;
    const expected = structuredClone(pdm.observation_info.result_details) as any[];
    // A zoom observation saves no continuum beam size
    expected[0].synthesized_beam_size.continuum = '';
    expect(save(pdm)).toEqual(expected);
  });

  test('reads results without observation sets as no links', () => {
    expect(
      targetObservationFromPdm(MockProposalBackend.observation_info.result_details as never, [])
    ).toEqual([]);
  });

  test('saves a link without sensitivity results with only its references', () => {
    expect(targetObservationToPdm([link])).toEqual([
      {
        observation_set_ref: 'obs1',
        data_product_ref: 'sdp1',
        target_ref: 't1',
        result: null,
        continuum_confusion_noise: null,
        spectral_confusion_noise: null,
        synthesized_beam_size: null
      }
    ]);
  });
});
