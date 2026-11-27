import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { saveProposalDraft } from '@utils/storage/storage';
import { ProposalType } from './proposal';

// How long the form must be still before its values are written
export const DRAFT_SAVE_DELAY_MS = 500;

/**
 * Mirrors the open proposal in the form into localStorage, keyed by the proposal's ID: as soon as
 * it is opened, then on each edit.
 * Subscribes without re-rendering the caller, and debounces the writes.
 */
export function useProposalDraftStorage(form: UseFormReturn<ProposalType>) {
  const { subscribe } = form;
  React.useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let pending: ProposalType | undefined;

    const flush = () => {
      clearTimeout(timer);
      timer = undefined;
      if (pending) {
        saveProposalDraft(pending.prslId, pending);
        pending = undefined;
      }
    };

    const unsubscribe = subscribe({
      formState: { values: true },
      callback: ({ values }) => {
        // The open proposal has changed (opened, switched or closed): write the previous one's
        // pending edit now, under its own ID. The ID is taken from these values, not from state,
        // so one proposal's values can't be stored under another's ID.
        if (pending && pending.prslId !== values.prslId) {
          flush();
        }
        if (!values.prslId) {
          return;
        }
        pending = values;
        clearTimeout(timer);
        timer = setTimeout(flush, DRAFT_SAVE_DELAY_MS);
      }
    });

    // Don't lose the last edit when the page is closed or reloaded within the delay
    window.addEventListener('beforeunload', flush);
    return () => {
      unsubscribe();
      window.removeEventListener('beforeunload', flush);
      flush();
    };
  }, [subscribe]);
}
