import { Metadata } from '../../types/metadata';
import { Proposal, ProposalBackend } from '../../types/proposal';

/**
 * Whether `incoming` describes a save later than the one already held.
 *
 * Nothing serialises the SaveButton interval save against the navigation save,
 * so their responses can land in either order. Applying the older one would
 * step the last-saved label backwards and drop the in-memory version below the
 * backend's, which surfaces later as an optimistic-concurrency failure.
 *
 * Ordering on version rather than last_modified_on: the backend bumps both in
 * the same atomic upsert, so version already carries the same order without
 * the timestamp-parsing edge cases (truncated microseconds, unparseable
 * formats) that a date comparison would need to work around.
 */
const isNewerThanHeld = (current: Proposal, incoming: Metadata): boolean => {
  // Proposal.version is typed as a required number. A proposal that came from
  // the API always has one. However, content2 is untyped and cast to Proposal
  // at the store boundary, and there are PHT paths that reset it to {}, so
  // this needs to be a bit defensive.
  const heldVersion = current.metadata?.version ?? current.version;

  // No version to order by on one side or the other - a malformed/partial
  // response, or nothing usable held to compare against. Accept, rather than
  // freeze the label on the strength of a comparison that never worked.
  if (typeof incoming.version !== 'number' || typeof heldVersion !== 'number') {
    return true;
  }
  return incoming.version > heldVersion;
};

/**
 * Folds the metadata a successful PutProposal returned into the in-memory
 * proposal, leaving every other field untouched.
 *
 * Returns `current` itself (same reference) when the response carries nothing
 * usable, is not for this proposal, or is not newer than what is already held -
 * so callers can skip a redundant store write with a `!==` check.
 */
export const mergeProposalSaveMetadata = (
  current: Proposal,
  response: ProposalBackend
): Proposal => {
  if (!response?.metadata?.last_modified_on) {
    return current;
  }

  // A response for a different proposal - the user left A with its PUT still in
  // flight and opened B - must never stamp this one with A's save time and
  // version. Only a positive mismatch blocks: an id absent from an ID-less
  // content2 cast is not evidence of one.
  if (response.prsl_id && current.id && response.prsl_id !== current.id) {
    return current;
  }

  if (!isNewerThanHeld(current, response.metadata)) {
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
