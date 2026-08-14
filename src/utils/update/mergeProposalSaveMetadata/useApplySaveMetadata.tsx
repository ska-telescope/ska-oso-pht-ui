import React from 'react';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { mergeProposalSaveMetadata } from './mergeProposalSaveMetadata';
import { Proposal, ProposalBackend } from '../../types/proposal';

/**
 * Returns a function that folds a successful PutProposal response's metadata
 * into shared proposal state.
 *
 * Call it only with a response already known not to be an error.
 */
export const useApplySaveMetadata = () => {
  const { application, updateAppContent2 } = storageObject.useStore();

  // updateAppContent2 takes a value, not an updater, so a save completing
  // later must merge into whatever the store holds *now* - not the snapshot it
  // was sent with, which would silently revert edits made mid-flight.
  const proposalRef = React.useRef(application.content2 as Proposal);
  proposalRef.current = application.content2 as Proposal;

  const mountedRef = React.useRef(true);
  React.useEffect(() => {
    // Must be set back to true here, not only cleared in the cleanup:
    // StrictMode runs setup -> cleanup -> setup in development.
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Deliberately not memoised - it is only ever called imperatively from async
  // handlers, and must not be added to any dependency array.
  return (response: ProposalBackend) => {
    // A response landing after this component unmounted would write a stale
    // whole-proposal snapshot over content2, discarding edits made since.
    if (!mountedRef.current) {
      return;
    }
    const merged = mergeProposalSaveMetadata(proposalRef.current, response);
    if (merged !== proposalRef.current) {
      proposalRef.current = merged;
      updateAppContent2(merged);
    }
  };
};
