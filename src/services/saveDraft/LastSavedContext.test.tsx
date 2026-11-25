import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { Proposal } from '@utils/types/proposal.tsx';
import { LastSavedProvider, useLastSaved } from './LastSavedContext';

const proposal = (id: string, lastUpdated = '2026-11-20T09:00:00Z') =>
  ({ id, lastUpdated }) as Proposal;

const renderLastSaved = () =>
  renderHook(() => useLastSaved(), {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <LastSavedProvider>{children}</LastSavedProvider>
    )
  }).result;

describe('LastSavedContext', () => {
  test('falls back to when the proposal was loaded before any save', () => {
    const result = renderLastSaved();
    expect(result.current.lastSavedOn(proposal('prsl-1'))).toBe('2026-11-20T09:00:00Z');
  });

  test('gives the latest save of the proposal', () => {
    const result = renderLastSaved();
    act(() => result.current.recordSave('prsl-1', '2026-11-25T14:32:00Z'));
    act(() => result.current.recordSave('prsl-1', '2026-11-25T14:33:00Z'));
    expect(result.current.lastSavedOn(proposal('prsl-1'))).toBe('2026-11-25T14:33:00Z');
    expect(result.current.lastSave).toEqual({
      proposalId: 'prsl-1',
      savedOn: '2026-11-25T14:33:00Z'
    });
  });

  test('ignores a save of another proposal', () => {
    const result = renderLastSaved();
    act(() => result.current.recordSave('prsl-1', '2026-11-25T14:32:00Z'));
    expect(result.current.lastSavedOn(proposal('prsl-2'))).toBe('2026-11-20T09:00:00Z');
  });

  test('remembers no saves without the provider', () => {
    const { result } = renderHook(() => useLastSaved());
    act(() => result.current.recordSave('prsl-1', '2026-11-25T14:32:00Z'));
    expect(result.current.lastSavedOn(proposal('prsl-1'))).toBe('2026-11-20T09:00:00Z');
  });
});
