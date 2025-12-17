// updateDataProductsPST.test.ts
import { describe, it, expect } from 'vitest';
import updateDataProductsPST from './updateDataProductsPST';
import { TYPE_CONTINUUM, TYPE_PST } from '@/utils/constants';
import { DataProductSDP } from '@/utils/types/dataProduct';
import Observation from '@/utils/types/observation';

describe('updateDataProductsPST', () => {
  const baseDataProduct: DataProductSDP = {
    id: 'SDP-0000000',
    dataProductType: 1,
    observationId: 'obs1',
    imageSizeValue: 0,
    imageSizeUnits: 0,
    pixelSizeValue: 0,
    pixelSizeUnits: 0,
    weighting: 0,
    robust: 0,
    polarisations: [],
    channelsOut: 40,
    taperValue: 0,
    fitSpectralPol: 0,
    timeAveraging: 0,
    frequencyAveraging: 0,
    bitDepth: 1,
    continuumSubtraction: false
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
    const oldRecs: DataProductSDP[] = [{ ...baseDataProduct, dataProductType: 1 }];
    const result = updateDataProductsPST(oldRecs, obsPST);

    expect(result).toHaveLength(1);
    expect(result[0].observationId).toBe(obsPST.id);
    expect(result[0].dataProductType).toBe(obsPST.pstMode);
  });

  it('keeps existing record when TYPE_PST and pstMode is the same', () => {
    const oldRecs: DataProductSDP[] = [{ ...baseDataProduct, dataProductType: 0 }];
    const result = updateDataProductsPST(oldRecs, obsPST);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(oldRecs[0]);
  });

  it('returns empty array when TYPE_PST and oldRecs is empty', () => {
    const result = updateDataProductsPST([], obsPST);
    expect(result).toEqual([]);
  });

  it('returns old records unchanged when type is not TYPE_PST', () => {
    const oldRecs: DataProductSDP[] = [baseDataProduct];
    const result = updateDataProductsPST(oldRecs, obsNonPST);

    expect(result).toEqual(oldRecs);
  });

  it('returns empty array when non-PST and oldRecs is undefined', () => {
    // @ts-expect-error testing undefined input
    const result = updateDataProductsPST(undefined, obsNonPST);
    expect(result).toEqual([]);
  });
});
