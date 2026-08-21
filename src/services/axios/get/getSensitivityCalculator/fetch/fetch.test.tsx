import { it, expect, vi } from 'vitest';
import { STATUS_ERROR } from '@utils/constants.ts';
import Fetch from './Fetch';

const mockTelescope = { code: 'TEST_TELESCOPE' };
const mockBaseUrl = '/base';
const mockProperties = '?prop=value';
const mockObservation = { duration: 1000 };

const mockMapping = vi.fn((data, observation) => ({
  mapped: true,
  data,
  observation
}));

it('should fetch data and map it successfully', async () => {
  const mockResponse = { data: { value: 42 } };
  const mockAxiosClient = {
    get: vi.fn().mockResolvedValue(mockResponse)
  };

  const result = await Fetch(
    mockAxiosClient,
    mockTelescope,
    mockBaseUrl,
    mockProperties,
    mockMapping,
    mockObservation
  );

  expect(mockAxiosClient.get).toHaveBeenCalledWith(expect.stringContaining(mockTelescope.code));
  expect(mockMapping).toHaveBeenCalledWith(mockResponse.data, mockObservation);
  expect(result).toEqual({
    mapped: true,
    data: mockResponse.data,
    observation: mockObservation
  });
});

it('should handle error with title and detail from response.data', async () => {
  const error = {
    message: 'Detailed error message'
  };

  const mockAxiosClient = {
    get: vi.fn().mockRejectedValue(error)
  };

  const result = await Fetch(
    mockAxiosClient,
    mockTelescope,
    mockBaseUrl,
    mockProperties,
    mockMapping,
    mockObservation
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
    mockAxiosClient,
    mockTelescope,
    mockBaseUrl,
    mockProperties,
    mockMapping,
    mockObservation
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
    mockAxiosClient,
    mockTelescope,
    mockBaseUrl,
    mockProperties,
    mockMapping,
    mockObservation
  );

  expect(result).toEqual({
    statusGUI: STATUS_ERROR,
    error: 'api.error'
  });
});
