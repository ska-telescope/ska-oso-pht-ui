import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { FormProvider, useForm, UseFormReturn } from 'react-hook-form';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { isLoggedIn } from '@ska-telescope/ska-login-page';
import { storageObject } from '@utils/storage/store';
import completeMockStore from '@utils/MockStore';
import { useSaveDraft } from './useSaveDraft';
import { ProposalType } from '@/models/proposals/proposal';
import phtTranslations from '../../../public/locales/en/pht.json';
import { PAGE_LANDING, PAGE_LINKING, PAGE_TEAM, PROPOSAL_STATUS } from '@/utils/constants';

const mockNotifyError = vi.hoisted(() => vi.fn());
const mockSaveToOda = vi.hoisted(() => vi.fn());
const mockOSD = vi.hoisted(() => ({ isSV: false }));

vi.mock('@/utils/notify/useNotify', () => ({
  useNotify: () => ({ notifyError: mockNotifyError })
}));

vi.mock('@/models/proposals/useProposalOda', () => ({
  useProposalOda: () => ({ saveToOda: mockSaveToOda })
}));

vi.mock('@/utils/osd/useOSDAccessors/useOSDAccessors', () => ({
  useOSDAccessors: () => ({ isSV: mockOSD.isSV })
}));

vi.mock('@ska-telescope/ska-login-page', () => ({
  isLoggedIn: vi.fn(() => true)
}));

const proposal = completeMockStore.application.content2;
const originalUseStore = storageObject.useStore;

const renderWith = (changes: object = {}, form?: UseFormReturn<ProposalType>) => {
  storageObject.useStore = () =>
    ({
      ...completeMockStore,
      application: { ...completeMockStore.application, content2: { ...proposal, ...changes } }
    }) as unknown as ReturnType<typeof originalUseStore>;
  const wrapper = form
    ? ({ children }: { children: React.ReactNode }) => (
        <FormProvider {...form}>{children}</FormProvider>
      )
    : undefined;
  return renderHook(() => useSaveDraft(), { wrapper }).result.current;
};

const words = (n: number) => Array(n).fill('word').join(' ');

describe('useSaveDraft', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(isLoggedIn).mockReturnValue(true);
    mockOSD.isSV = false;
  });

  afterEach(() => {
    storageObject.useStore = originalUseStore;
  });

  describe('saveDraft', () => {
    test('saves a draft and resolves true', async () => {
      mockSaveToOda.mockResolvedValue({ prsl_id: 'prsl-1' });
      await expect(renderWith().saveDraft()).resolves.toBe(true);
      expect(mockSaveToOda).toHaveBeenCalledWith(proposal, PROPOSAL_STATUS.DRAFT, undefined);
      expect(mockNotifyError).not.toHaveBeenCalled();
    });

    test('shows the error and resolves false when the save fails', async () => {
      mockSaveToOda.mockResolvedValue({ error: 'Save failed' });
      await expect(renderWith().saveDraft()).resolves.toBe(false);
      expect(mockNotifyError).toHaveBeenCalledWith('Save failed');
    });

    test('does not save when blocked', async () => {
      await expect(renderWith({ title: '   ' }).saveDraft()).resolves.toBe(false);
      expect(mockSaveToOda).not.toHaveBeenCalled();
    });

    test('waits for an earlier save, from any caller, to finish before starting', async () => {
      let finishFirst: (value: object) => void = () => {};
      mockSaveToOda
        .mockReturnValueOnce(new Promise((resolve) => (finishFirst = resolve)))
        .mockResolvedValueOnce({ prsl_id: 'prsl-1' });
      const first = renderWith().saveDraft();
      const second = renderWith({ title: 'Newer title' }).saveDraft();

      await Promise.resolve();
      expect(mockSaveToOda).toHaveBeenCalledOnce();

      finishFirst({ prsl_id: 'prsl-1' });
      await expect(first).resolves.toBe(true);
      await expect(second).resolves.toBe(true);
      expect(mockSaveToOda).toHaveBeenCalledTimes(2);
      expect(mockSaveToOda).toHaveBeenLastCalledWith(
        expect.objectContaining({ title: 'Newer title' }),
        PROPOSAL_STATUS.DRAFT,
        undefined
      );
    });

    test('saves the form as it was when the save was asked for, not when it runs', async () => {
      let finishFirst: (value: object) => void = () => {};
      mockSaveToOda
        .mockReturnValueOnce(new Promise((resolve) => (finishFirst = resolve)))
        .mockResolvedValueOnce({ prsl_id: 'prsl-1' });
      const { result: form } = renderHook(() =>
        useForm<ProposalType>({ defaultValues: { title: 'Typed title' } })
      );
      const { saveDraft } = renderWith({}, form.current);

      const first = saveDraft();
      const second = saveDraft();
      // e.g. leaving the editor resets the form while the second save is still queued
      act(() => form.current.reset({ title: '' }));
      finishFirst({ prsl_id: 'prsl-1' });
      await first;
      await second;

      expect(mockSaveToOda).toHaveBeenLastCalledWith(
        proposal,
        PROPOSAL_STATUS.DRAFT,
        expect.objectContaining({ title: 'Typed title' })
      );
    });

    test('still runs a queued save after an earlier save throws', async () => {
      mockSaveToOda
        .mockRejectedValueOnce(new Error('Network Error'))
        .mockResolvedValueOnce({ prsl_id: 'prsl-1' });
      const first = renderWith().saveDraft();
      const second = renderWith().saveDraft();

      await expect(first).rejects.toThrow('Network Error');
      await expect(second).resolves.toBe(true);
    });
  });

  describe('isSaveBlocked', () => {
    const maxTitleWords = Number(phtTranslations.title.maxWord);
    const maxAbstractWords = Number(phtTranslations.abstract.maxWord);

    test('is not blocked for a valid proposal, up to the word limits', () => {
      expect(renderWith().isSaveBlocked()).toBe(false);
      expect(renderWith({ title: words(maxTitleWords) }).isSaveBlocked()).toBe(false);
      expect(renderWith({ abstract: words(maxAbstractWords) }).isSaveBlocked()).toBe(false);
    });

    test.each([
      ['an empty title', { title: '' }],
      ['no id', { id: null }],
      ['an empty id', { id: '' }],
      ['a title over the word limit', { title: words(maxTitleWords + 1) }],
      ['an abstract over the word limit', { abstract: words(maxAbstractWords + 1) }]
    ])('is blocked with %s', (_, changes) => {
      expect(renderWith(changes).isSaveBlocked()).toBe(true);
    });

    test('is blocked when not logged in', () => {
      vi.mocked(isLoggedIn).mockReturnValue(false);
      expect(renderWith().isSaveBlocked()).toBe(true);
    });
  });

  describe('isSavePage', () => {
    test('is true on the proposal pages only', () => {
      const { isSavePage } = renderWith();
      expect(isSavePage(PAGE_TEAM)).toBe(true);
      expect(isSavePage(PAGE_LINKING)).toBe(true);
      expect(isSavePage(PAGE_LANDING)).toBe(false);
    });

    test('uses the SV pages for SV', () => {
      mockOSD.isSV = true;
      expect(renderWith().isSavePage(PAGE_LINKING)).toBe(false);
    });

    test('is false before the proposal has an id, or when not logged in', () => {
      expect(renderWith({ id: null }).isSavePage(PAGE_TEAM)).toBe(false);
      vi.mocked(isLoggedIn).mockReturnValue(false);
      expect(renderWith().isSavePage(PAGE_TEAM)).toBe(false);
    });
  });
});
