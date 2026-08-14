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
