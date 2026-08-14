import React from 'react';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { useApplySaveMetadata } from './useApplySaveMetadata';
import { Metadata } from '../../types/metadata';
import { Proposal, ProposalBackend } from '../../types/proposal';

const mockUpdateAppContent2 = vi.fn();
const mockContent2 = { current: {} as Proposal };

vi.mock('@ska-telescope/ska-gui-local-storage', () => ({
  storageObject: {
    useStore: () => ({
      application: { content2: mockContent2.current },
      updateAppContent2: mockUpdateAppContent2
    })
  }
}));

const NEW_STAMP = '2026-08-13T10:00:00.000000Z';

const withMetadata = (): ProposalBackend =>
  ({
    prsl_id: 'prsl-123',
    metadata: {
      version: 2,
      created_by: 'creator',
      created_on: '2026-01-01T00:00:00.000000Z',
      pdm_version: '18.0.0',
      last_modified_by: 'newuser',
      last_modified_on: NEW_STAMP
    } as Metadata
  }) as ProposalBackend;

const withoutMetadata = (): ProposalBackend => ({ prsl_id: 'prsl-123' }) as ProposalBackend;

describe('useApplySaveMetadata', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockContent2.current = {
      id: 'prsl-123',
      title: 'A title',
      lastUpdated: '2026-08-13T09:00:00.000000Z',
      lastUpdatedBy: 'olduser',
      version: 1
    } as Proposal;
  });

  test('writes the merged proposal to the store', () => {
    const { result } = renderHook(() => useApplySaveMetadata());

    result.current(withMetadata());

    expect(mockUpdateAppContent2).toHaveBeenCalledTimes(1);
    expect(mockUpdateAppContent2.mock.calls[0][0]).toMatchObject({
      title: 'A title',
      lastUpdated: NEW_STAMP,
      lastUpdatedBy: 'newuser',
      version: 2
    });
  });

  test('does not write when the response carries no metadata', () => {
    const { result } = renderHook(() => useApplySaveMetadata());

    result.current(withoutMetadata());

    expect(mockUpdateAppContent2).not.toHaveBeenCalled();
  });

  test('merges into the latest proposal, not the one held when the save started', () => {
    const { result, rerender } = renderHook(() => useApplySaveMetadata());

    // Simulates the user editing while the request is in flight.
    mockContent2.current = { ...mockContent2.current, title: 'Edited mid-flight' } as Proposal;
    rerender();

    result.current(withMetadata());

    expect(mockUpdateAppContent2.mock.calls[0][0]).toMatchObject({
      title: 'Edited mid-flight',
      lastUpdated: NEW_STAMP
    });
  });

  test('a response landing after its own component unmounted still applies', () => {
    // PHT - the route shell holding <Routes> - calls this hook too, and outlives
    // the banner and dialogs that also call it. So a save that resolves after
    // the banner unmounted has both a live dispatch and a current snapshot to
    // merge into; dropping it would leave the label and version stale while the
    // user has already been told the save succeeded.
    const shell = renderHook(() => useApplySaveMetadata());
    const banner = renderHook(() => useApplySaveMetadata());

    banner.unmount();
    // The shell re-renders on a store change the unmounted banner never saw.
    mockContent2.current = { ...mockContent2.current, title: 'Edited after unmount' } as Proposal;
    shell.rerender();

    banner.result.current(withMetadata());

    expect(mockUpdateAppContent2).toHaveBeenCalledTimes(1);
    expect(mockUpdateAppContent2.mock.calls[0][0]).toMatchObject({
      title: 'Edited after unmount',
      lastUpdated: NEW_STAMP
    });
  });

  test('does not write once every consumer has unmounted', () => {
    // With nothing mounted there is no tree left to render the result, and
    // nothing keeping the shared snapshot current - so it could only be written
    // back stale.
    const { result, unmount } = renderHook(() => useApplySaveMetadata());

    unmount();
    result.current(withMetadata());

    expect(mockUpdateAppContent2).not.toHaveBeenCalled();
  });

  test('still writes after a StrictMode remount', () => {
    // StrictMode's dev cycle is setup -> cleanup -> setup. A mounted flag that
    // is only cleared in the cleanup stays false forever, silently dropping
    // every later save. Nothing outside a dev build would catch that, so pin it
    // here: the double-invoked effect must leave the hook usable.
    const { result } = renderHook(() => useApplySaveMetadata(), {
      wrapper: ({ children }) => <React.StrictMode>{children}</React.StrictMode>
    });

    result.current(withMetadata());

    expect(mockUpdateAppContent2).toHaveBeenCalledTimes(1);
  });
});
