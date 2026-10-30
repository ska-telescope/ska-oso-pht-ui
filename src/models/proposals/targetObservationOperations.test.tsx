import { beforeEach, describe, expect, test, vi } from 'vitest';
import { STATUS_OK, STATUS_PARTIAL } from '@/utils/constants';
import TargetObservation from '@/utils/types/targetObservation';
import { SensCalcResults } from '@/utils/types/sensCalcResults';
import { getTargetObservationKey } from '@/utils/update/sensCalc/updateSensCalc';
import type { ProposalFormAccess } from './proposal';
import { patchSensCalcResults } from './targetObservationOperations';

const link = (targetId: string, observationId: string): TargetObservation => ({
  targetId,
  observationId,
  dataProductsSDPId: `sdp-${observationId}`,
  sensCalc: { statusGUI: STATUS_PARTIAL, error: '' }
});

const result: SensCalcResults = {
  statusGUI: STATUS_OK,
  error: '',
  section1: [{ field: 'f', value: '1' }]
};

describe('patchSensCalcResults', () => {
  let values: Record<string, unknown>;
  let form: ProposalFormAccess;

  beforeEach(() => {
    values = { targetObservation: [link('t1', 'o1'), link('t2', 'o2')] };
    form = {
      getValues: vi.fn((name: string) => values[name]),
      setValue: vi.fn((name: string, value: unknown) => {
        values[name] = value;
      })
    } as unknown as ProposalFormAccess;
  });

  test('writes the results to the matching link only, changing nothing else', () => {
    patchSensCalcResults(form, [
      { targetObservationKey: getTargetObservationKey(link('t2', 'o2')), sensCalc: result }
    ]);

    expect(values.targetObservation).toEqual([
      link('t1', 'o1'),
      { ...link('t2', 'o2'), sensCalc: result }
    ]);
  });

  test('applies the results to the links as they are now', () => {
    // A link was added while the results were being calculated
    values.targetObservation = [link('t1', 'o1'), link('t2', 'o2'), link('t3', 'o3')];

    patchSensCalcResults(form, [
      { targetObservationKey: getTargetObservationKey(link('t1', 'o1')), sensCalc: result }
    ]);

    expect(values.targetObservation).toEqual([
      { ...link('t1', 'o1'), sensCalc: result },
      link('t2', 'o2'),
      link('t3', 'o3')
    ]);
  });

  test('leaves the form alone when no link matches', () => {
    patchSensCalcResults(form, [
      { targetObservationKey: getTargetObservationKey(link('gone', 'o9')), sensCalc: result }
    ]);
    patchSensCalcResults(form, []);

    expect(form.setValue).not.toHaveBeenCalled();
  });

  test('leaves the form alone when there are no links', () => {
    values.targetObservation = [];

    patchSensCalcResults(form, [
      { targetObservationKey: getTargetObservationKey(link('t1', 'o1')), sensCalc: result }
    ]);

    expect(form.setValue).not.toHaveBeenCalled();
  });
});
