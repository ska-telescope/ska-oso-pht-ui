import { describe, test, expect, vi } from 'vitest';
import Observation from '@utils/types/observation.tsx';
import Target from '../types/target';
import { DataProductSDPNew } from '../types/dataProduct';
import { calculateSensCalcData } from './sensCalc';
import getSensCalc from '@/services/axios/get/getSensitivityCalculator/sensitivityCalculator/getSensitivityCalculatorAPIData';

vi.mock(
  '@/services/axios/get/getSensitivityCalculator/sensitivityCalculator/getSensitivityCalculatorAPIData',
  () => ({
    default: vi.fn()
  })
);

describe('calculateSensCalcData', () => {
  test('calls getSensCalc with correct arguments and returns its result', async () => {
    const mockObservation = {} as Observation;
    const mockTarget = {} as Target;
    const mockDataProductSDP = {} as DataProductSDPNew;
    const mockResult = { data: 123 };
    (getSensCalc as any).mockResolvedValue(mockResult);

    const result = await calculateSensCalcData(mockObservation, mockTarget, mockDataProductSDP);

    expect(getSensCalc).toHaveBeenCalledWith(mockObservation, mockTarget, mockDataProductSDP);
    expect(result).toBe(mockResult);
  });
});
