import { describe, it, expect } from 'vitest';
import updateDataProductsOnObservationChange, {
  PSTData
} from './updateDataProductsOnObservationChange.tsx';

import {
  DETECTED_FILTER_BANK_VALUE,
  FLOW_THROUGH_VALUE,
  PULSAR_TIMING_VALUE,
  TYPE_CONTINUUM,
  TYPE_PST
} from '@/utils/constants';

import {
  DataProductSDPNew,
  SDPFilterbankPSTData,
  SDPFlowthroughPSTData,
  SDPTimingPSTData
} from '@/utils/types/dataProduct';

import Observation from '@/utils/types/observation';

describe('PSTData', () => {
  it('creates timing PST data', () => {
    const obs = { pstMode: PULSAR_TIMING_VALUE } as Observation;
    const result = PSTData(obs) as SDPTimingPSTData;

    expect(result.dataProductType).toBe(PULSAR_TIMING_VALUE);
  });

  it('creates detected filterbank PST data', () => {
    const obs = { pstMode: DETECTED_FILTER_BANK_VALUE } as Observation;
    const result = PSTData(obs) as SDPFilterbankPSTData;

    expect(result.dataProductType).toBe(DETECTED_FILTER_BANK_VALUE);
    expect(result.polarisations).toEqual(['I']);
    expect(result.bitDepth).toBe(1);
  });

  it('creates flowthrough PST data for default case', () => {
    const obs = { pstMode: 999 } as Observation;
    const result = PSTData(obs) as SDPFlowthroughPSTData;

    expect(result.dataProductType).toBe(FLOW_THROUGH_VALUE);
    expect(result.polarisations).toEqual(['X']);
  });
});

describe('dataProductsOnObservationChange', () => {
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
    pstMode: DETECTED_FILTER_BANK_VALUE
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
          dataProductType: FLOW_THROUGH_VALUE,
          polarisations: ['X'],
          bitDepth: 1
        } as SDPFlowthroughPSTData
      }
    ];

    const result = updateDataProductsOnObservationChange(oldRecs, obsPST);

    expect(result).toHaveLength(1);
    expect(result[0].observationId).toBe(obsPST.id);
    expect((result[0].data as SDPFilterbankPSTData).dataProductType).toBe(
      DETECTED_FILTER_BANK_VALUE
    );
  });

  it('normalizes existing record when TYPE_PST and pstMode is the same', () => {
    const oldRecs: DataProductSDPNew[] = [
      {
        ...baseDataProduct,
        data: {
          dataProductType: DETECTED_FILTER_BANK_VALUE,
          polarisations: ['I'],
          bitDepth: 1
        } as SDPFilterbankPSTData
      }
    ];

    const obsSameMode = {
      ...obsPST,
      pstMode: DETECTED_FILTER_BANK_VALUE
    };

    const result = updateDataProductsOnObservationChange(oldRecs, obsSameMode);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: 'SDP-0000000',
      observationId: 'obs1',
      data: PSTData(obsSameMode)
    });
  });

  it('returns empty array when TYPE_PST and oldRecs is empty', () => {
    const result = updateDataProductsOnObservationChange([], obsPST);
    expect(result).toEqual([]);
  });

  it('returns old records unchanged when type is not TYPE_PST', () => {
    const oldRecs: DataProductSDPNew[] = [baseDataProduct];
    const result = updateDataProductsOnObservationChange(oldRecs, obsNonPST);

    expect(result).toEqual(oldRecs);
  });

  it('returns empty array when non-PST and oldRecs is undefined', () => {
    // @ts-expect-error testing undefined input
    const result = updateDataProductsOnObservationChange(undefined, obsNonPST);
    expect(result).toEqual([]);
  });
});
