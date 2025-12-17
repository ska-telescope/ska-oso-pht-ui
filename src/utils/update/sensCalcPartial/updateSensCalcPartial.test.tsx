// updateSensCalcPartial.test.ts
import { describe, it, expect } from 'vitest';
import updateSensCalcPartial from './updateSensCalcPartial';
import { STATUS_PARTIAL, TYPE_CONTINUUM, TYPE_PST } from '@/utils/constants';
import TargetObservation from '@/utils/types/targetObservation';
import Observation from '@/utils/types/observation';

describe('updateSensCalcPartial', () => {
  const baseTargetObs: TargetObservation = {
    observationId: 'obs1',
    targetId: 1,
    sensCalc: {
      id: 1,
      title: 'original',
      statusGUI: 0,
      error: 'none'
    },
    dataProductsSDPId: 'dp1'
  };

  const otherTargetObs: TargetObservation = {
    observationId: 'obs2',
    targetId: 2,
    sensCalc: {
      id: 2,
      title: 'original',
      statusGUI: 0,
      error: 'none'
    },
    dataProductsSDPId: 'dp2'
  };

  const matchingObservation: Observation = {
    id: 'obs1',
    type: TYPE_PST,
    pstMode: 0
  } as Observation;

  const nonMatchingObservation: Observation = {
    id: 'obs2',
    type: TYPE_CONTINUUM
  } as Observation;

  it('updates sensCalc to STATUS_PARTIAL when observationId matches', () => {
    const result = updateSensCalcPartial([baseTargetObs], matchingObservation);

    expect(result).toHaveLength(1);
    expect(result[0].observationId).toBe('obs1');
    expect(result[0].targetId).toBe(1);
    expect(result[0].sensCalc.statusGUI).toBe(STATUS_PARTIAL);
    expect(result[0].sensCalc.title).toBe('');
    expect(result[0].sensCalc.error).toBe('');
    expect(result[0].dataProductsSDPId).toBe('');
  });

  it('does not update records when observationId does not match', () => {
    const result = updateSensCalcPartial([baseTargetObs], nonMatchingObservation);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(baseTargetObs);
  });

  it('updates only the matching record when multiple records exist', () => {
    const result = updateSensCalcPartial([baseTargetObs, otherTargetObs], matchingObservation);

    expect(result).toHaveLength(2);
    expect(result[0].sensCalc.statusGUI).toBe(STATUS_PARTIAL);
    expect(result[1]).toEqual(otherTargetObs);
  });

  it('returns empty array when oldRecs is empty', () => {
    const result = updateSensCalcPartial([], matchingObservation);
    expect(result).toEqual([]);
  });
});
