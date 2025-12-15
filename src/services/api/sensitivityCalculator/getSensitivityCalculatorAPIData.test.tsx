import { describe, test, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import * as CONSTANTS from '@/utils/constants';
import getSensCalc from './getSensitivityCalculatorAPIData';
import { SENSCALC_CONTINUUM_MOCKED } from './SensCalcResultsMOCK';
import { sensCalcResultsAPIResponseMock } from './SensCalcResultsAPIResponseMOCK';
import axiosClient from '@/services/axios/axiosClient/axiosClient';
import { SENSCALC_CONTINUUM_MOCKED_NEW } from './SensCalcResultsMockNew';

describe('getSensitivityCalculatorAPIData Service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mock('../axiosClient', () => ({
      default: { get: vi.fn() }
    }));
  });

  test('returns mapped mock data when USE_LOCAL_DATA_SENSITIVITY_CALC is true', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA_SENSITIVITY_CALC', 'get').mockReturnValue(true);
    const result = await getSensCalc(
      CONSTANTS.DEFAULT_CONTINUUM_OBSERVATION_LOW_AA2,
      CONSTANTS.DEFAULT_TARGETS,
      CONSTANTS.DEFAULT_DATA_PRODUCT
    );
    expect(result).toEqual(SENSCALC_CONTINUUM_MOCKED);
  });

  test('returns mapped data from API when USE_LOCAL_DATA is false', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA_SENSITIVITY_CALC', 'get').mockReturnValue(false);
    vi.spyOn(axiosClient, 'get').mockResolvedValue({ data: sensCalcResultsAPIResponseMock });
    const result = await getSensCalc(
      CONSTANTS.DEFAULT_CONTINUUM_OBSERVATION_LOW_AA2,
      CONSTANTS.DEFAULT_TARGETS,
      CONSTANTS.DEFAULT_DATA_PRODUCT
    );
    expect(result).to.deep.equal(SENSCALC_CONTINUUM_MOCKED_NEW);
  });

  test('returns error message on API failure', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    vi.spyOn(axiosClient, 'get').mockRejectedValue(new Error('Network Error'));
    const result = await getSensCalc(
      CONSTANTS.DEFAULT_CONTINUUM_OBSERVATION_LOW_AA2,
      CONSTANTS.DEFAULT_TARGETS,
      CONSTANTS.DEFAULT_DATA_PRODUCT
    );
    expect(result).to.deep.equal({ error: 'Network Error' });
  });

  //   test('returns error.API_UNKNOWN_ERROR when thrown error is not an instance of Error', async () => {
  //     vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
  //     const errorOut = { unexpected: 'error' };
  //     vi.spyOn(axiosClient, 'get').mockRejectedValue(errorOut);
  //     const result = await getSensCalc(CONSTANTS.DEFAULT_CONTINUUM_OBSERVATION_LOW_AA2, CONSTANTS.DEFAULT_TARGETS, CONSTANTS.DEFAULT_DATA_PRODUCT);
  //     expect(result).to.deep.equal( { error: [errorOut] });
  //   });

  //   test('returns error.API_UNKNOWN_ERROR when thrown error is not an instance of Error', async () => {
  //     vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
  //     const errorOut =   {
  //         "title": "Validation Error",
  //         "detail": "Specified pointing centre is always below the horizon from the SKA LOW site"
  //     };
  //     vi.spyOn(axiosClient, 'get').mockRejectedValue({ data: errorOut });
  //     const result = await getSensCalc(CONSTANTS.DEFAULT_CONTINUUM_OBSERVATION_LOW_AA2, CONSTANTS.DEFAULT_TARGETS, CONSTANTS.DEFAULT_DATA_PRODUCT);
  //     console.dir(result, { depth: null });
  //     expect(result).to.deep.equal( { error: "Specified pointing centre is always below the horizon from the SKA LOW site" });
  //   });

  //   test('returns error.API_UNKNOWN_ERROR when API does not return data property', async () => {
  //     vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
  //     mockedAuthClient.get.mockResolvedValue({});
  //     const result = await GetPanel(mockedAuthClient, 'dummy_id');
  //     expect(result).toBe('error.API_UNKNOWN_ERROR');
  //   });
});
