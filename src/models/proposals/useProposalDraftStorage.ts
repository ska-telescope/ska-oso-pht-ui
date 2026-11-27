import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { saveProposalDraft } from '@utils/storage/storage';
import { ProposalType } from './proposal';

// How long the form must be still before its values are written
export const DRAFT_SAVE_DELAY_MS = 500;

/**
 * Mirrors local edits to the proposal form into localStorage, keyed by the proposal's ID.
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
      formState: { values: true, isDirty: true },
      callback: ({ values, isDirty }) => {
        // A reset (loading, creating or closing a proposal) leaves the form clean: those are the
        // proposal's saved values, not local edits. With no prslId, no proposal is open. The ID
        // is taken from these values, not from state, so a switch of proposal can't store one
        // proposal's values under another's ID.
        if (!isDirty || !values.prslId) {
          clearTimeout(timer);
          timer = undefined;
          pending = undefined;
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
