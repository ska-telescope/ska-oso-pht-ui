import { it, expect, vi } from 'vitest';
import { STATUS_ERROR } from '@utils/constants.ts';
import Fetch from './Fetch';
import { Telescope } from '@utils/types/typesSensCalc';
import { SensCalcQueryParams } from '../sensitivityCalculator/sensCalHelpers';
import { AxiosAuthClient } from '@/services/axios/axiosAuthClient/axiosAuthClient';

const mockTelescope = { code: 'TEST_TELESCOPE' } as Telescope;
const mockBaseUrl = '/base';
const mockProperties: SensCalcQueryParams = { prop: 'value' };
const mockParams = { prop: 'value', n_subbands: 4 };

it('should fetch data and return it successfully', async () => {
  const mockResponse = { data: { value: 42 } };
  const mockAxiosClient = {
    get: vi.fn().mockResolvedValue(mockResponse)
  };

  const result = await Fetch(
    mockAxiosClient as unknown as AxiosAuthClient,
    mockTelescope,
    mockBaseUrl,
    mockProperties
  );

  expect(mockAxiosClient.get).toHaveBeenCalledWith(
    expect.stringContaining(mockTelescope.code),
    expect.anything()
  );
  expect(result).toEqual(mockResponse.data);
});

it('should pass object params via axios config', async () => {
  const mockResponse = { data: { value: 42 } };
  const mockAxiosClient = {
    get: vi.fn().mockResolvedValue(mockResponse)
  };

  const result = await Fetch(
    mockAxiosClient as unknown as AxiosAuthClient,
    mockTelescope,
    mockBaseUrl,
    mockParams
  );

  expect(mockAxiosClient.get).toHaveBeenCalledWith(expect.stringContaining(mockTelescope.code), {
    params: mockParams
  });
  expect(result).toEqual(mockResponse.data);
});

it('should handle error with title and detail from response.data', async () => {
  const error = {
    message: 'Detailed error message'
  };

  const mockAxiosClient = {
    get: vi.fn().mockRejectedValue(error)
  };

  const result = await Fetch(
    mockAxiosClient as unknown as AxiosAuthClient,
    mockTelescope,
    mockBaseUrl,
    mockProperties
  );

  expect(result).toEqual({
    statusGUI: STATUS_ERROR,
    error: 'Detailed error message'
  });
});

it('should handle error with message fallback', async () => {
  const error = {
    message: 'Fallback error message'
  };

  const mockAxiosClient = {
    get: vi.fn().mockRejectedValue(error)
  };

  const result = await Fetch(
    mockAxiosClient as unknown as AxiosAuthClient,
    mockTelescope,
    mockBaseUrl,
    mockProperties
  );

  expect(result).toEqual({
    statusGUI: STATUS_ERROR,
    error: 'Fallback error message'
  });
});

it('should handle error with generic string fallback', async () => {
  const error = 'api.error';

  const mockAxiosClient = {
    get: vi.fn().mockRejectedValue(error)
  };

  const result = await Fetch(
    mockAxiosClient as unknown as AxiosAuthClient,
    mockTelescope,
    mockBaseUrl,
    mockProperties
  );

  expect(result).toEqual({
    statusGUI: STATUS_ERROR,
    error: 'api.error'
  });
});
