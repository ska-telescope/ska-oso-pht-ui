import { describe, expect, test } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { getProposalFormDefaults, useProposalForm } from './useProposalForm';
import { PROPOSAL_TYPE, VELOCITY_DEFINITION } from '@/utils/constants';

const slicesFor = (id: string) => ({
  targets: [
    {
      id: `target-${id}`,
      name: `Target ${id}`,
      kind: 0,
      velocityDefinition: VELOCITY_DEFINITION.RADIO
    }
  ],
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
  test('starts with no proposal open', () => {
    const { result } = renderHook(() => useProposalForm());
    expect(result.current.getValues()).toEqual(getProposalFormDefaults());
  });

  test('starts with the initial values it is given', () => {
    const initialValues = {
      ...getProposalFormDefaults(),
      prslId: 'p1',
      title: 'First',
      ...slicesFor('p1')
    };
    const { result } = renderHook(() => useProposalForm({}, initialValues));
    expect(result.current.getValues()).toEqual(initialValues);
  });

  // The form is only changed by resetting it (load, create, clone, new proposal, closing)
  test('keeps in-progress edits when re-rendered with other initial values', () => {
    const { result, rerender } = renderHook(
      ({ title }: { title: string }) =>
        useProposalForm({}, { ...getProposalFormDefaults(), title }),
      { initialProps: { title: 'First' } }
    );

    act(() => result.current.setValue('title', 'Typed title'));
    rerender({ title: 'Second' });

    expect(result.current.getValues('title')).toBe('Typed title');
  });

  test('starts valid with a completed abstract and empty structural slices', async () => {
    const { result } = renderHook(() =>
      useProposalForm(
        {},
        {
          ...getProposalFormDefaults(),
          prslId: 'p1',
          title: 'A title',
          proposalType: { type: PROPOSAL_TYPE.STANDARD, subTypes: [] },
          abstract: 'A valid abstract'
        }
      )
    );
    let valid = false;
    await act(async () => {
      valid = await result.current.trigger();
    });
    expect(valid).toBe(true);
  });
});
