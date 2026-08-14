import React from 'react';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { mergeProposalSaveMetadata } from './mergeProposalSaveMetadata';
import { Proposal, ProposalBackend } from '../../types/proposal';

// updateAppContent2 takes a value, not an updater, and the store exposes no
// imperative read - only the useStore hook - so a save completing later has to
// merge into a snapshot captured during render. Holding that snapshot per hook
// instance freezes it at unmount, which forces a choice between discarding the
// response and writing a stale whole proposal back over content2.
//
// Tracking it module-side avoids both. content2 holds exactly one proposal, so
// every consumer sees the same value, and PHT - the route shell holding
// <Routes> - calls this hook and re-renders on every content2 change for the
// whole session. A response arriving after the component that started it
// unmounted therefore still merges into the live proposal.
let latestProposal: Proposal | null = null;
let consumers = 0;

/**
 * Returns a function that folds a successful PutProposal response's metadata
 * into shared proposal state.
 *
 * Call it only with a response already known not to be an error.
 */
export const useApplySaveMetadata = () => {
  const { application, updateAppContent2 } = storageObject.useStore();

  latestProposal = application.content2 as Proposal;

  React.useEffect(() => {
    // Counted rather than flagged: several components hold this hook at once,
    // and StrictMode runs setup -> cleanup -> setup in development.
    consumers += 1;
    return () => {
      consumers -= 1;
    };
  }, []);

  // Deliberately not memoised - it is only ever called imperatively from async
  // handlers, and must not be added to any dependency array.
  return (response: ProposalBackend) => {
    // No consumer left means no tree to render the result, and nothing keeping
    // the snapshot current - so it could only be written back stale.
    if (consumers === 0 || !latestProposal) {
      return;
    }
    const merged = mergeProposalSaveMetadata(latestProposal, response);
    if (merged !== latestProposal) {
      latestProposal = merged;
      updateAppContent2(merged);
    }
  };
};
