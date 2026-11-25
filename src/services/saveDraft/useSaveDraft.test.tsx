import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { FormProvider, useForm, UseFormReturn } from 'react-hook-form';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { storageObject } from '@utils/storage/store';
import completeMockStore from '@utils/MockStore';
import { useSaveDraft } from './useSaveDraft';
import { ProposalType } from '@/models/proposals/proposal';
import phtTranslations from '../../../public/locales/en/pht.json';
import { PAGE_LANDING, PAGE_LINKING, PAGE_TEAM, PROPOSAL_STATUS } from '@/utils/constants';

const mockNotifyError = vi.hoisted(() => vi.fn());
const mockSaveToOda = vi.hoisted(() => vi.fn());
const mockRecordSave = vi.hoisted(() => vi.fn());
const mockOSD = vi.hoisted(() => ({ isSV: false }));

vi.mock('@/utils/notify/useNotify', () => ({
  useNotify: () => ({ notifyError: mockNotifyError })
}));

vi.mock('@/models/proposals/useProposalOda', () => ({
  useProposalOda: () => ({ saveToOda: mockSaveToOda })
}));

vi.mock('./LastSavedContext', () => ({
  useLastSaved: () => ({ recordSave: mockRecordSave })
}));

vi.mock('@/utils/osd/useOSDAccessors/useOSDAccessors', () => ({
  useOSDAccessors: () => ({ isSV: mockOSD.isSV })
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
      expect(mockRecordSave).not.toHaveBeenCalled();
    });

    test('does not save when blocked', async () => {
      await expect(renderWith({ title: '   ' }).saveDraft()).resolves.toBe(false);
      expect(mockSaveToOda).not.toHaveBeenCalled();
      expect(mockRecordSave).not.toHaveBeenCalled();
    });

    test("records the backend's time for a successful save", async () => {
      mockSaveToOda.mockResolvedValue({
        prsl_id: 'prsl-1',
        metadata: { last_modified_on: '2026-11-25T14:32:00Z' }
      });
      await renderWith().saveDraft();
      expect(mockRecordSave).toHaveBeenCalledExactlyOnceWith(proposal.id, '2026-11-25T14:32:00Z');
    });

    test('records the current time when the response does not give one', async () => {
      vi.useFakeTimers({ now: new Date('2026-11-25T14:33:00Z'), toFake: ['Date'] });
      try {
        mockSaveToOda.mockResolvedValue({ prsl_id: 'prsl-1' });
        await renderWith().saveDraft();
        expect(mockRecordSave).toHaveBeenCalledExactlyOnceWith(
          proposal.id,
          '2026-11-25T14:33:00.000Z'
        );
      } finally {
        vi.useRealTimers();
      }
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

    test('is false before the proposal has an id', () => {
      expect(renderWith({ id: null }).isSavePage(PAGE_TEAM)).toBe(false);
    });
  });
});
