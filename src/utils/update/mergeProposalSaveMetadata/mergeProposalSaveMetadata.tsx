import { Metadata } from '../../types/metadata';
import { Proposal, ProposalBackend } from '../../types/proposal';
import { parseDate } from '../../present/present';

/**
 * Whether `incoming` describes a save later than the one already held.
 *
 * Nothing serialises the SaveButton interval save against the navigation save,
 * so their responses can land in either order. Applying the older one would
 * step the last-saved label backwards and drop the in-memory version below the
 * backend's, which surfaces later as an optimistic-concurrency failure.
 */
const isNewerThanHeld = (current: Proposal, incoming: Metadata): boolean => {
  // parseDate, rather than Date.parse, so the compact YYYYMMDDT... form the
  // backend also emits is understood here as it is everywhere else.
  const held = parseDate(current.metadata?.last_modified_on ?? current.lastUpdated);
  const incomingDate = parseDate(incoming.last_modified_on);

  // Nothing to order by - an absent stamp on a freshly created proposal, or an
  // unparseable one from either side. Accept, rather than freeze the label on
  // the strength of a comparison that never worked.
  if (!held || !incomingDate) {
    return true;
  }
  const heldTime = held.getTime();
  const incomingTime = incomingDate.getTime();
  if (incomingTime !== heldTime) {
    return incomingTime > heldTime;
  }

  // Same instant: only a higher version carries anything new. Parsing truncates
  // the backend's microseconds, so two saves within the same millisecond land
  // here rather than ordering on time alone.
  const heldVersion = current.metadata?.version ?? current.version;
  return (
    typeof incoming.version === 'number' &&
    typeof heldVersion === 'number' &&
    incoming.version > heldVersion
  );
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
  // version. Only a positive mismatch blocks: an id absent from either side is
  // not evidence of one.
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
