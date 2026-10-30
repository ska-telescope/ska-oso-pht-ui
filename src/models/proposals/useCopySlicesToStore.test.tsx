import React from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { storageObject, StoreProvider } from '@utils/storage/store';
import Proposal from '@utils/types/proposal';
import Target from '@utils/types/target';
import { useProposalForm } from './useProposalForm';
import { useCopySlicesToStore } from './useCopySlicesToStore';

const target = (id: string): Target => ({ id, name: `Target ${id}`, kind: 0 });

// The global form seeded from the store with the copy back to it, as PHT.tsx sets them up
const useHarness = () => {
  const store = storageObject.useStore();
  const form = useProposalForm(store.application.content2 as Proposal);
  useCopySlicesToStore(form);
  return { store, form };
};

const renderHarness = () =>
  renderHook(useHarness, {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <StoreProvider>{children}</StoreProvider>
    )
  });

const storedProposal = (result: { current: ReturnType<typeof useHarness> }) =>
  result.current.store.application.content2 as Proposal;

const open = (result: { current: ReturnType<typeof useHarness> }, proposal: object) =>
  act(() => {
    result.current.store.updateAppContent2(proposal);
  });

describe('useCopySlicesToStore', () => {
  // The store is shared between tests, so clear it, then unmount so only one form copies into it
  beforeEach(() => {
    const { result, unmount } = renderHarness();
    act(() => {
      result.current.store.clearApplication();
    });
    unmount();
  });

  test('copies form edits of the slices into the store', () => {
    const { result } = renderHarness();
    open(result, { id: 'p1', title: 'First', targets: [target('a')] });

    act(() => result.current.form.setValue('targets', [target('a'), target('b')]));

    expect(storedProposal(result).targets).toEqual([target('a'), target('b')]);
    expect(storedProposal(result).title).toBe('First');
  });

  test('gives the store its own copy, so the form stays editable', () => {
    const { result } = renderHarness();
    open(result, { id: 'p1', targets: [] });

    act(() => result.current.form.setValue('targets', [target('a')]));

    expect(storedProposal(result).targets).not.toBe(result.current.form.getValues('targets'));
    expect(() =>
      act(() => result.current.form.setValue('targets.0.name', 'Renamed'))
    ).not.toThrow();
  });

  test("does not copy the previous proposal's slices when switching proposals", () => {
    const { result } = renderHarness();
    open(result, { id: 'p1', targets: [target('a')] });

    open(result, { id: 'p2', targets: [target('z')] });

    expect(storedProposal(result).targets).toEqual([target('z')]);
    expect(result.current.form.getValues('targets')).toEqual([target('z')]);
  });

  test('puts the form slices back when a legacy write stores an older copy', () => {
    const { result } = renderHarness();
    open(result, { id: 'p1', targets: [target('a')] });

    open(result, { ...storedProposal(result), targets: [] });

    expect(storedProposal(result).targets).toEqual([target('a')]);
  });

  test('lets only one form copy into the store', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const first = renderHarness();
    const second = renderHarness();
    open(first.result, { id: 'p1', targets: [target('a')] });

    act(() => second.result.current.form.setValue('targets', [target('other')]));

    expect(consoleError).toHaveBeenCalledWith(
      'useCopySlicesToStore: another form already copies into the store'
    );
    expect(storedProposal(first.result).targets).toEqual([target('a')]);
    consoleError.mockRestore();
  });

  test('does nothing while no proposal is open', () => {
    const { result } = renderHarness();

    act(() => result.current.form.setValue('targets', [target('a')]));

    expect(storedProposal(result)).toEqual([]);
  });
});
