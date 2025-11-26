import { Target } from 'node:inspector';
import { describe, test, expect, vi } from 'vitest';
import Observation from '@utils/types/observation.tsx';
import { calculateSensCalcData } from './sensCalc';
import getSensCalc from '@/services/api/sensitivityCalculator/getSensitivityCalculatorAPIData';
vi.mock('@/services/api/sensitivityCalculator/getSensitivityCalculatorAPIData');

describe('calculateSensCalcData', () => {
  test('calls getSensCalc with correct arguments and returns its result', async () => {
    const mockObservation = {} as Observation;
    const mockTarget = {} as Target;
    const mockResult = { data: 123 };
    ((getSensCalc as unknown) as vi.Mock).mockResolvedValue(mockResult);

    const result = await calculateSensCalcData(mockObservation, mockTarget);

    expect(getSensCalc).toHaveBeenCalledWith(mockObservation, mockTarget);
    expect(result).toBe(mockResult);
  });
});
