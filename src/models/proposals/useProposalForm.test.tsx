import { describe, expect, test } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useProposalForm } from './useProposalForm';
import { PROPOSAL_TYPE } from '@/utils/constants';
import type { DocumentValues } from './documents';

type Props = {
  id?: string;
  title: string;
  proposalType?: (typeof PROPOSAL_TYPE)[keyof typeof PROPOSAL_TYPE];
};

describe('useProposalForm', () => {
  test('seeds the title from the proposal', () => {
    const { result } = renderHook(() => useProposalForm({ id: 'p1', title: 'Saved title' }));
    expect(result.current.getValues('title')).toBe('Saved title');
    expect(result.current.getValues('proposalType')).toBeNull();
  });

  test('seeds and re-seeds document references when switching proposals', () => {
    const { result, rerender } = renderHook(
      (proposal: Partial<Props & DocumentValues>) => useProposalForm(proposal),
      {
        initialProps: {
          id: 'p1',
          title: 'First',
          sciencePDF: { documentId: 'science-doc-p1', isUploadedPdf: true }
        } as Partial<Props & DocumentValues>
      }
    );
    expect(result.current.getValues('sciencePDF')).toEqual({
      documentId: 'science-doc-p1',
      isUploadedPdf: true
    });

    rerender({ id: 'p2', title: 'Second' });
    expect(result.current.getValues('sciencePDF')).toBeNull();
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
});
