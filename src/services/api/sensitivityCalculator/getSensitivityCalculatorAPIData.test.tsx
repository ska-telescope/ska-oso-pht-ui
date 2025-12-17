import { describe, test, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import getSensCalc from './getSensitivityCalculatorAPIData';
import { SENSCALC_CONTINUUM_MOCKED } from './SensCalcResultsMOCK';
import {
  sensCalcResultsAPIResponseMockContinuum,
  sensCalcResultsAPIResponseMockSpectral
} from './SensCalcResultsAPIResponseMOCK';
import {
  SENSCALC_CONTINUUM_MOCKED_NEW,
  SENSCALC_SPECTRAL_MOCKED_NEW
} from './SensCalcResultsMockNew';
import axiosClient from '@/services/axios/axiosClient/axiosClient';
import * as CONSTANTS from '@/utils/constants';

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

  test('returns continuum mapped data from API', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA_SENSITIVITY_CALC', 'get').mockReturnValue(false);
    vi.spyOn(axiosClient, 'get').mockResolvedValue({
      data: sensCalcResultsAPIResponseMockContinuum
    });
    const result = await getSensCalc(
      CONSTANTS.DEFAULT_CONTINUUM_OBSERVATION_LOW_AA2,
      CONSTANTS.DEFAULT_TARGETS,
      CONSTANTS.DEFAULT_DATA_PRODUCT
    );
    expect(result).to.deep.equal(SENSCALC_CONTINUUM_MOCKED_NEW);
  });

  test('returns spectral mapped data from API', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA_SENSITIVITY_CALC', 'get').mockReturnValue(false);
    vi.spyOn(axiosClient, 'get').mockResolvedValue({
      data: sensCalcResultsAPIResponseMockSpectral
    });
    const result = await getSensCalc(
      CONSTANTS.DEFAULT_ZOOM_OBSERVATION_LOW_AA2,
      CONSTANTS.DEFAULT_TARGETS,
      CONSTANTS.DEFAULT_DATA_PRODUCT
    );
    expect(result).to.deep.equal(SENSCALC_SPECTRAL_MOCKED_NEW);
  });

  test('returns error message on API failure', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    vi.spyOn(axiosClient, 'get').mockRejectedValue(new Error('Network Error'));
    const result = await getSensCalc(
      CONSTANTS.DEFAULT_CONTINUUM_OBSERVATION_LOW_AA2,
      CONSTANTS.DEFAULT_TARGETS,
      CONSTANTS.DEFAULT_DATA_PRODUCT
    );
    expect(result).to.deep.equal({ error: 'Error: Network Error' });
  });

  test('returns error message on Sensitivity Calculator Error', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    const errorOut = {
      title: 'Validation Error',
      detail: 'Specified pointing centre is always below the horizon from the SKA LOW site'
    };
    vi.spyOn(axiosClient, 'get').mockRejectedValueOnce({
      isAxiosError: true,
      response: { data: errorOut, status: 400, statusText: 'Bad Request' },
      message: errorOut.detail
    });
    const result = await getSensCalc(
      CONSTANTS.DEFAULT_CONTINUUM_OBSERVATION_LOW_AA2,
      CONSTANTS.DEFAULT_TARGETS,
      CONSTANTS.DEFAULT_DATA_PRODUCT
    );
    expect(result).to.deep.equal({
      error: 'Error: Specified pointing centre is always below the horizon from the SKA LOW site'
    });
  });
});
