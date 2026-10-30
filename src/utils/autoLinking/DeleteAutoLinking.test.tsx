import { expect } from 'vitest';
import TargetObservation from '@utils/types/targetObservation.tsx';
import { CalibrationStrategy } from '@utils/types/calibrationStrategy.tsx';
import deleteAutoLinking from '@utils/autoLinking/DeleteAutoLinking.tsx';
import type { ProposalFormAccess } from '@/models/proposals/proposal';
import Target from '../types/target';

describe('deleteAutoLinking', () => {
  const target: Target = { id: 't1' } as Target;
  let values: Record<string, unknown>;
  let form: ProposalFormAccess;

  beforeEach(() => {
    values = {
      targets: [{ id: 't1' }, { id: 't2' }],
      targetObservation: [
        { targetId: 't1', observationId: 'o1' },
        { targetId: 't2', observationId: 'o2' }
      ] as TargetObservation[],
      calibrationStrategy: [
        { observationIdRef: 'o1' },
        { observationIdRef: 'o2' }
      ] as CalibrationStrategy[]
    };
    form = {
      getValues: vi.fn((name: string) => values[name]),
      setValue: vi.fn((name: string, value: unknown) => {
        values[name] = value;
      })
    } as unknown as ProposalFormAccess;
  });

  it('removes the target with its results and calibration from the form', () => {
    deleteAutoLinking(target, form);

    expect(values).toEqual({
      targets: [{ id: 't2' }],
      targetObservation: [{ targetId: 't2', observationId: 'o2' }],
      calibrationStrategy: [{ observationIdRef: 'o2' }]
    });
  });

  it('leaves the form unchanged if the target is not found', () => {
    const before = structuredClone(values);
    deleteAutoLinking({ id: 'notfound' } as Target, form);

    expect(values).toEqual(before);
  });

  it('handles a proposal without calibration', () => {
    values.calibrationStrategy = [];
    deleteAutoLinking(target, form);

    expect(values.targets).toEqual([{ id: 't2' }]);
    expect(values.targetObservation).toEqual([{ targetId: 't2', observationId: 'o2' }]);
    expect(values.calibrationStrategy).toEqual([]);
  });
});
