import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { STORAGE_KEYS } from '@utils/storage/storageKeys';
import { getProposalFormDefaults, useProposalForm } from './useProposalForm';
import { DRAFT_SAVE_DELAY_MS, useProposalDraftStorage } from './useProposalDraftStorage';

const PRSL_ID = 'prsl-t0001-20260101-00001';
const KEY = STORAGE_KEYS.proposalDraft(PRSL_ID);

// The global form with a proposal open, mirrored to localStorage as PHT does it
const renderForm = (prslId = PRSL_ID) =>
  renderHook(() => {
    const form = useProposalForm({}, { ...getProposalFormDefaults(), prslId });
    useProposalDraftStorage(form);
    return form;
  });

const readDraft = (key = KEY) => JSON.parse(window.localStorage.getItem(key) ?? 'null');

describe('useProposalDraftStorage', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('writes an edit under the proposal ID once the delay has passed', () => {
    const { result } = renderForm();
    act(() => result.current.setValue('title', 'New title', { shouldDirty: true }));
    expect(window.localStorage.getItem(KEY)).toBeNull();

    act(() => vi.advanceTimersByTime(DRAFT_SAVE_DELAY_MS));
    const draft = readDraft();
    expect(draft.values.title).toBe('New title');
    expect(draft.values.prslId).toBe(PRSL_ID);
  });

  test('waits until edits stop, then writes the latest values', () => {
    const { result } = renderForm();
    // Each edit comes before the previous one's delay has passed, so none is written yet
    for (const title of ['A', 'AB', 'ABC']) {
      act(() => result.current.setValue('title', title, { shouldDirty: true }));
      act(() => vi.advanceTimersByTime(DRAFT_SAVE_DELAY_MS - 1));
      expect(window.localStorage.getItem(KEY)).toBeNull();
    }
    act(() => vi.advanceTimersByTime(1));
    expect(readDraft().values.title).toBe('ABC');
  });

  test('does not write a reset (e.g. a proposal loaded from the ODA)', () => {
    const { result } = renderForm();
    act(() => result.current.reset({ ...getProposalFormDefaults(), prslId: 'other', title: 'X' }));
    act(() => vi.advanceTimersByTime(DRAFT_SAVE_DELAY_MS));
    expect(window.localStorage.length).toBe(0);
  });

  test('does not write when no proposal is open', () => {
    const { result } = renderForm('');
    act(() => result.current.setValue('title', 'New title', { shouldDirty: true }));
    act(() => vi.advanceTimersByTime(DRAFT_SAVE_DELAY_MS));
    expect(window.localStorage.length).toBe(0);
  });

  test('a reset drops an edit not yet written', () => {
    const { result } = renderForm();
    act(() => result.current.setValue('title', 'New title', { shouldDirty: true }));
    act(() => result.current.reset(getProposalFormDefaults()));
    act(() => vi.advanceTimersByTime(DRAFT_SAVE_DELAY_MS));
    expect(window.localStorage.length).toBe(0);
  });

  test('writes a pending edit on unmount', () => {
    const { result, unmount } = renderForm();
    act(() => result.current.setValue('title', 'New title', { shouldDirty: true }));
    unmount();
    expect(readDraft().values.title).toBe('New title');
  });
});
