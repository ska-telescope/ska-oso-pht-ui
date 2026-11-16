import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { ProposalType } from './proposal';
import { getProposalFormDefaults, useProposalForm } from './useProposalForm';
import { loadProposalFormBackup, saveProposalFormBackup } from './proposalFormBackupStorage';
import { useProposalFormBackup } from './useProposalFormBackup';

const renderProposalForm = (proposalId: string, title: string) =>
  renderHook(() => {
    const form = useProposalForm({ id: proposalId, title });
    useProposalFormBackup(form, proposalId);
    return form;
  });

describe('useProposalFormBackup', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('debounces dirty form values under the proposal-specific key', () => {
    const { result } = renderProposalForm('proposal-1', 'Server title');

    act(() => result.current.setValue('title', 'Local edit'));
    act(() => vi.advanceTimersByTime(350));

    expect(loadProposalFormBackup('proposal-1')?.title).toBe('Local edit');
    expect(loadProposalFormBackup('proposal-2')).toBeNull();
  });

  test('restores a matching proposal backup over the server values', () => {
    const values: ProposalType = { ...getProposalFormDefaults(), title: 'Local edit' };
    saveProposalFormBackup('proposal-1', values);

    const { result } = renderProposalForm('proposal-1', 'Server title');

    expect(result.current.getValues('title')).toBe('Local edit');
  });

  test('keeps backups for different proposals isolated', () => {
    saveProposalFormBackup('proposal-1', {
      ...getProposalFormDefaults(),
      title: 'First proposal'
    });
    saveProposalFormBackup('proposal-2', {
      ...getProposalFormDefaults(),
      title: 'Second proposal'
    });

    expect(loadProposalFormBackup('proposal-1')?.title).toBe('First proposal');
    expect(loadProposalFormBackup('proposal-2')?.title).toBe('Second proposal');
  });
});
