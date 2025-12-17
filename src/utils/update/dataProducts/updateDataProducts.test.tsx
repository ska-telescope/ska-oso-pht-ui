// updateDataProducts.test.ts
import { describe, it, expect } from 'vitest';
import updateDataProducts from './updateDataProducts';
import { DataProductSDP } from '@/utils/types/dataProduct';

// Helper to construct a minimal record for tests and cast to DataProductSDP
const makeRec = (id: string, name: string) => (({ id, name } as unknown) as DataProductSDP);

describe('updateDataProducts', () => {
  it('replaces an existing record with the same id', () => {
    const oldRecs: DataProductSDP[] = [makeRec('1', 'old one'), makeRec('2', 'old two')];
    const newRec: DataProductSDP = makeRec('1', 'new one');

    const result = updateDataProducts(oldRecs, newRec);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(newRec);
    expect(result[1]).toEqual(oldRecs[1]);
  });

  it('adds a new record when oldRecs is empty', () => {
    const oldRecs: DataProductSDP[] = [];
    const newRec: DataProductSDP = makeRec('1', 'new one');

    const result = updateDataProducts(oldRecs, newRec);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(newRec);
  });

  it('adds a new record when oldRecs is undefined', () => {
    const newRec: DataProductSDP = makeRec('1', 'new one');

    const result = updateDataProducts(undefined as any, newRec);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(newRec);
  });

  it('keeps other records unchanged when replacing one', () => {
    const oldRecs: DataProductSDP[] = [makeRec('1', 'old one'), makeRec('2', 'old two')];
    const newRec: DataProductSDP = makeRec('2', 'new two');

    const result = updateDataProducts(oldRecs, newRec);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(oldRecs[0]);
    expect(result[1]).toEqual(newRec);
  });
});
