import { describe, expect, test } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useProposalForm } from './useProposalForm';
import { PROPOSAL_TYPE } from '@/utils/constants';
import Target from '@/utils/types/target';
import TargetObservation from '@/utils/types/targetObservation';
import { CalibrationStrategy } from '@/utils/types/calibrationStrategy';

type Props = {
  id?: string;
  title: string;
  proposalType?: (typeof PROPOSAL_TYPE)[keyof typeof PROPOSAL_TYPE];
  targets?: Target[];
  targetObservation?: TargetObservation[];
  calibrationStrategy?: CalibrationStrategy[];
};

const slicesFor = (id: string) => ({
  targets: [{ id: `target-${id}`, name: `Target ${id}`, kind: 0 }],
  targetObservation: [
    { targetId: `target-${id}`, observationId: `obs-${id}`, dataProductsSDPId: `sdp-${id}` }
  ],
  calibrationStrategy: [
    {
      observatoryDefined: true,
      id: `cal-${id}`,
      observationIdRef: `obs-${id}`,
      calibrators: null,
      notes: null
    }
  ]
});

describe('useProposalForm', () => {
  test('seeds the title from the proposal', () => {
    const { result } = renderHook(() => useProposalForm({ id: 'p1', title: 'Saved title' }));
    expect(result.current.getValues('title')).toBe('Saved title');
    expect(result.current.getValues('proposalType')).toBeNull();
  });

  test('re-seeds the title when a proposal is loaded after mount', () => {
    const { result, rerender } = renderHook((proposal: Props) => useProposalForm(proposal), {
      initialProps: { id: undefined, title: '' } as Props
    });
    expect(result.current.getValues('title')).toBe('');

    rerender({ id: 'p1', title: 'Saved title' });

    expect(result.current.getValues('title')).toBe('Saved title');
  });

  test('re-seeds the title when switching to a different proposal', () => {
    const { result, rerender } = renderHook((proposal: Props) => useProposalForm(proposal), {
      initialProps: { id: 'p1', title: 'First' } as Props
    });

    rerender({ id: 'p2', title: 'Second' });

    expect(result.current.getValues('title')).toBe('Second');
  });

  test('keeps in-progress edits when the same proposal changes', () => {
    const { result, rerender } = renderHook((proposal: Props) => useProposalForm(proposal), {
      initialProps: { id: 'p1', title: 'First' } as Props
    });

    act(() => result.current.setValue('title', 'Typed title'));
    rerender({ id: 'p1', title: 'Typed title' });

    expect(result.current.getValues('title')).toBe('Typed title');
  });

  test('seeds and re-seeds the proposal type when switching proposals', () => {
    const { result, rerender } = renderHook((proposal: Props) => useProposalForm(proposal), {
      initialProps: {
        id: 'p1',
        title: 'First',
        proposalType: PROPOSAL_TYPE.STANDARD
      } as Props
    });
    expect(result.current.getValues('proposalType')).toBe(PROPOSAL_TYPE.STANDARD);

    rerender({
      id: 'p2',
      title: 'Second',
      proposalType: PROPOSAL_TYPE.SCIENCE_VERIFICATION
    });
    expect(result.current.getValues('proposalType')).toBe(PROPOSAL_TYPE.SCIENCE_VERIFICATION);
  });

  test('keeps in-progress type edits when the same proposal changes', () => {
    const { result, rerender } = renderHook((proposal: Props) => useProposalForm(proposal), {
      initialProps: {
        id: 'p1',
        title: 'First',
        proposalType: PROPOSAL_TYPE.STANDARD
      } as Props
    });

    act(() => result.current.setValue('proposalType', PROPOSAL_TYPE.KEY_SCIENCE));
    rerender({ id: 'p1', title: 'First', proposalType: PROPOSAL_TYPE.STANDARD });

    expect(result.current.getValues('proposalType')).toBe(PROPOSAL_TYPE.KEY_SCIENCE);
  });

  test('seeds targets, links and calibration from the proposal', () => {
    const { result } = renderHook(() =>
      useProposalForm({ id: 'p1', title: 'First', ...slicesFor('p1') })
    );
    const { targets, targetObservation, calibrationStrategy } = result.current.getValues();
    expect({ targets, targetObservation, calibrationStrategy }).toEqual(slicesFor('p1'));
  });

  test('defaults targets, links and calibration to empty lists', () => {
    const { result } = renderHook(() => useProposalForm({ id: 'p1', title: 'First' }));
    expect(result.current.getValues('targets')).toEqual([]);
    expect(result.current.getValues('targetObservation')).toEqual([]);
    expect(result.current.getValues('calibrationStrategy')).toEqual([]);
  });

  test('re-seeds targets, links and calibration when switching proposals', () => {
    const { result, rerender } = renderHook((proposal: Props) => useProposalForm(proposal), {
      initialProps: { id: 'p1', title: 'First', ...slicesFor('p1') } as Props
    });

    rerender({ id: 'p2', title: 'Second', ...slicesFor('p2') });

    const { targets, targetObservation, calibrationStrategy } = result.current.getValues();
    expect({ targets, targetObservation, calibrationStrategy }).toEqual(slicesFor('p2'));
  });

  test('clears targets, links and calibration when switching to a proposal without them', () => {
    const { result, rerender } = renderHook((proposal: Props) => useProposalForm(proposal), {
      initialProps: { id: 'p1', title: 'First', ...slicesFor('p1') } as Props
    });

    rerender({ id: 'p2', title: 'Second' });

    expect(result.current.getValues('targets')).toEqual([]);
    expect(result.current.getValues('targetObservation')).toEqual([]);
    expect(result.current.getValues('calibrationStrategy')).toEqual([]);
  });

  test('keeps the form slices when the same proposal changes in the store', () => {
    const { result, rerender } = renderHook((proposal: Props) => useProposalForm(proposal), {
      initialProps: { id: 'p1', title: 'First', ...slicesFor('p1') } as Props
    });

    rerender({ id: 'p1', title: 'First', ...slicesFor('other') });

    expect(result.current.getValues('targets')).toEqual(slicesFor('p1').targets);
  });

  test('starts valid with empty slices', async () => {
    const { result } = renderHook(() =>
      useProposalForm({ id: 'p1', title: 'A title', proposalType: PROPOSAL_TYPE.STANDARD })
    );
    let valid = false;
    await act(async () => {
      valid = await result.current.trigger();
    });
    expect(valid).toBe(true);
  });
});
