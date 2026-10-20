import { describe, expect, test } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useProposalForm } from './useProposalForm';

type Props = { id?: string; title: string };

describe('useProposalForm', () => {
  test('seeds the title from the proposal', () => {
    const { result } = renderHook(() => useProposalForm({ id: 'p1', title: 'Saved title' }));
    expect(result.current.getValues('title')).toBe('Saved title');
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
});
