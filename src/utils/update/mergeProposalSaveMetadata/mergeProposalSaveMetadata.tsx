import { Metadata } from '../../types/metadata';
import { Proposal, ProposalBackend } from '../../types/proposal';

/**
 * Folds the metadata a successful PutProposal returned into the in-memory
 * proposal, leaving every other field untouched.
 *
 * Returns `current` itself (same reference) when the response carries nothing
 * usable, so callers can skip a redundant store write with a `!==` check.
 */
export const mergeProposalSaveMetadata = (
  current: Proposal,
  response: ProposalBackend
): Proposal => {
  if (!response?.metadata?.last_modified_on) {
    return current;
  }

  // Merge rather than replace: a partial response would otherwise leave the
  // scalar fields below disagreeing with the metadata block they mirror.
  const metadata: Metadata = { ...current.metadata, ...response.metadata };

  return {
    ...current,
    metadata,
    lastUpdated: metadata.last_modified_on,
    lastUpdatedBy: metadata.last_modified_by ?? current.lastUpdatedBy,
    version: metadata.version ?? current.version
  };
};
