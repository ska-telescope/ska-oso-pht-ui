// updateDataProductsPST.test.ts
import { describe, it, expect } from 'vitest';
import updateDataProductsPST from './updateDataProductsPST';
import {
  DETECTED_FILTER_BANK_VALUE,
  FLOW_THROUGH_VALUE,
  TYPE_CONTINUUM,
  TYPE_PST
} from '@/utils/constants';
import {
  DataProductSDPNew,
  SDPFilterbankPSTData,
  SDPFlowthroughPSTData
} from '@/utils/types/dataProduct';
import Observation from '@/utils/types/observation';

describe('updateDataProductsPST', () => {
  const baseDataProduct: DataProductSDPNew = {
    id: 'SDP-0000000',
    observationId: 'obs1',
    data: {
      dataProductType: FLOW_THROUGH_VALUE,
      polarisations: ['X'],
      bitDepth: 1
    } as SDPFlowthroughPSTData
  };

  const obsPST: Observation = {
    id: 'obs1',
    type: TYPE_PST,
    pstMode: 0
  } as Observation;

  const obsNonPST: Observation = {
    id: 'obs2',
    type: TYPE_CONTINUUM
  } as Observation;

  it('replaces existing record when TYPE_PST and pstMode differs', () => {
    const oldRecs: DataProductSDPNew[] = [
      {
        ...baseDataProduct,
        data: {
          ...baseDataProduct.data,
          dataProductType: DETECTED_FILTER_BANK_VALUE
        } as SDPFilterbankPSTData
      }
    ];
    const result = updateDataProductsPST(oldRecs, obsPST);

    expect(result).toHaveLength(1);
    expect(result[0].observationId).toBe(obsPST.id);
    expect((result[0]?.data as SDPFilterbankPSTData).dataProductType).toBe(obsPST.pstMode);
  });

  it('keeps existing record when TYPE_PST and pstMode is the same', () => {
    const oldRecs: DataProductSDPNew[] = [
      {
        ...baseDataProduct,
        data: {
          ...baseDataProduct.data,
          dataProductType: FLOW_THROUGH_VALUE
        } as SDPFlowthroughPSTData
      }
    ];
    const result = updateDataProductsPST(oldRecs, obsPST);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(oldRecs[0]);
  });

  it('returns empty array when TYPE_PST and oldRecs is empty', () => {
    const result = updateDataProductsPST([], obsPST);
    expect(result).toEqual([]);
  });

  it('returns old records unchanged when type is not TYPE_PST', () => {
    const oldRecs: DataProductSDPNew[] = [baseDataProduct];
    const result = updateDataProductsPST(oldRecs, obsNonPST);

    expect(result).toEqual(oldRecs);
  });

  it('returns empty array when non-PST and oldRecs is undefined', () => {
    // @ts-expect-error testing undefined input
    const result = updateDataProductsPST(undefined, obsNonPST);
    expect(result).toEqual([]);
  });
});
