import { describe, expect, test } from 'vitest';
import { mergeProposalSaveMetadata } from './mergeProposalSaveMetadata';
import { Metadata } from '../../types/metadata';
import { Proposal, ProposalBackend } from '../../types/proposal';

const OLD_STAMP = '2026-08-13T09:00:00.000000Z';
const NEW_STAMP = '2026-08-13T10:00:00.000000Z';

const metadata = (over: Partial<Metadata> = {}): Metadata => ({
  version: 1,
  created_by: 'creator',
  created_on: '2026-01-01T00:00:00.000000Z',
  pdm_version: '18.0.0',
  last_modified_by: 'olduser',
  last_modified_on: OLD_STAMP,
  ...over
});

// Proposal has many required fields that are irrelevant here, so build the
// subset under test and cast.
const proposal = (over: Partial<Proposal> = {}): Proposal =>
  ({
    id: 'prsl-t0001-20260813-00001',
    title: 'A title',
    lastUpdated: OLD_STAMP,
    lastUpdatedBy: 'olduser',
    version: 1,
    metadata: metadata(),
    ...over
  }) as Proposal;

const response = (over: Partial<ProposalBackend> = {}): ProposalBackend =>
  ({ prsl_id: 'prsl-t0001-20260813-00001', ...over }) as ProposalBackend;

describe('mergeProposalSaveMetadata', () => {
  test('merges backend metadata while preserving in-memory edits', () => {
    const current = proposal({ title: 'Edited while the save was in flight' });

    const result = mergeProposalSaveMetadata(
      current,
      response({
        metadata: metadata({
          version: 2,
          last_modified_by: 'newuser',
          last_modified_on: NEW_STAMP
        })
      })
    );

    expect(result.title).toBe('Edited while the save was in flight');
    expect(result.lastUpdated).toBe(NEW_STAMP);
    expect(result.lastUpdatedBy).toBe('newuser');
    expect(result.version).toBe(2);
    expect(result.metadata?.last_modified_on).toBe(NEW_STAMP);
  });

  test('returns the same reference when the response has no metadata', () => {
    const current = proposal();
    expect(mergeProposalSaveMetadata(current, response())).toBe(current);
  });

  test('returns the same reference when metadata has no last_modified_on', () => {
    const current = proposal();
    const partial = { version: 2 } as Metadata;
    expect(mergeProposalSaveMetadata(current, response({ metadata: partial }))).toBe(current);
  });

  test('ignores a response older than what is already held', () => {
    // Nothing serialises the SaveButton interval save against the navigation
    // save, so responses can land out of order. Applying the older one would
    // step the label backwards and drop the in-memory version below the
    // backend's, setting up a later optimistic-concurrency failure.
    const current = proposal({
      lastUpdated: NEW_STAMP,
      lastUpdatedBy: 'newuser',
      version: 2,
      metadata: metadata({ version: 2, last_modified_by: 'newuser', last_modified_on: NEW_STAMP })
    });

    const result = mergeProposalSaveMetadata(
      current,
      response({
        metadata: metadata({ version: 1, last_modified_by: 'olduser', last_modified_on: OLD_STAMP })
      })
    );

    expect(result).toBe(current);
  });

  test('ignores a response carrying the same instant and version', () => {
    const current = proposal();
    expect(mergeProposalSaveMetadata(current, response({ metadata: metadata() }))).toBe(current);
  });

  test('applies a response at the same instant but a higher version', () => {
    // The backend bumps version and last_modified_on together on every save,
    // so a higher version alone is enough to know this response is newer,
    // even when both land at the same instant.
    const current = proposal();

    const result = mergeProposalSaveMetadata(
      current,
      response({ metadata: metadata({ version: 2, last_modified_by: 'newuser' }) })
    );

    expect(result.version).toBe(2);
    expect(result.lastUpdatedBy).toBe('newuser');
  });

  test('applies the first save, when nothing is held to compare against', () => {
    const current = proposal({
      lastUpdated: '',
      lastUpdatedBy: '',
      version: 0,
      metadata: undefined
    });

    const result = mergeProposalSaveMetadata(current, response({ metadata: metadata() }));

    expect(result.lastUpdated).toBe(OLD_STAMP);
    expect(result.version).toBe(1);
  });

  test('applies the first save, when the held version itself is missing rather than zero', () => {
    // A proposal snapshot taken before any version has ever been recorded
    // (e.g. straight off the store, cast loosely at a boundary) can lack a
    // version field entirely rather than defaulting it to 0 - undefined must
    // not be compared numerically against the incoming version.
    const current = { id: 'prsl-t0001-20260813-00001' } as unknown as Proposal;

    const result = mergeProposalSaveMetadata(
      current,
      response({ metadata: metadata({ version: 2, last_modified_on: NEW_STAMP }) })
    );

    expect(result.lastUpdated).toBe(NEW_STAMP);
    expect(result.version).toBe(2);
  });

  test('ignores a response for a different proposal', () => {
    // Leave proposal A with its navigation PUT in flight, open proposal B, and
    // A's response must not stamp B's metadata with A's save time and version.
    const current = proposal({ id: 'prsl-t0001-20260813-00002' });

    const result = mergeProposalSaveMetadata(
      current,
      response({
        prsl_id: 'prsl-t0001-20260813-00001',
        metadata: metadata({ version: 2, last_modified_on: NEW_STAMP })
      })
    );

    expect(result).toBe(current);
  });

  test('applies when either side carries no id, which is not evidence of a mismatch', () => {
    const current = proposal({ id: undefined as unknown as string });

    const result = mergeProposalSaveMetadata(
      current,
      response({ metadata: metadata({ version: 2, last_modified_on: NEW_STAMP }) })
    );

    expect(result.lastUpdated).toBe(NEW_STAMP);
  });

  test('a partial response leaves scalars and metadata in agreement', () => {
    const current = proposal();
    const partial = { last_modified_on: NEW_STAMP } as Metadata;

    const result = mergeProposalSaveMetadata(current, response({ metadata: partial }));

    expect(result.lastUpdated).toBe(NEW_STAMP);
    // Both the scalar and the metadata field fall back together - never one
    // holding the old value while the other is missing.
    expect(result.lastUpdatedBy).toBe('olduser');
    expect(result.metadata?.last_modified_by).toBe('olduser');
    expect(result.version).toBe(1);
    expect(result.metadata?.version).toBe(1);
  });
});
