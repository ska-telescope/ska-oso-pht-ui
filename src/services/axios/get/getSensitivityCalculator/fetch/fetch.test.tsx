import { it, expect, vi } from 'vitest';
import { STATUS_ERROR } from '@utils/constants.ts';
import Fetch from './Fetch';

const mockTelescope = { code: 'TEST_TELESCOPE' };
const mockBaseUrl = '/base';
const mockProperties = '?prop=value';
const mockTarget = { name: 'Target1' };
const mockObservation = { duration: 1000 };
const mockStandardData = null;
const mockContinuumData = null;

const mockMapping = vi.fn((data, target, observation) => ({
  mapped: true,
  data,
  target,
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
    mockStandardData,
    mockContinuumData,
    mockTarget,
    mockObservation
  );

  expect(mockAxiosClient.get).toHaveBeenCalledWith(expect.stringContaining(mockTelescope.code));
  expect(mockMapping).toHaveBeenCalledWith(mockResponse.data, mockTarget, mockObservation);
  expect(result).toEqual({
    mapped: true,
    data: mockResponse.data,
    target: mockTarget,
    observation: mockObservation
  });
});

it('should handle error with title and detail from response.data', async () => {
  const error = {
    response: {
      data: {
        title: 'Custom Error Title',
        detail: 'Detailed error message'
      }
    }
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
    mockStandardData,
    mockContinuumData,
    mockTarget
  );

  expect(result).toEqual({
    id: 1,
    statusGUI: STATUS_ERROR,
    error: 'Custom Error Title',
    results: ['Detailed error message']
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
    mockStandardData,
    mockContinuumData,
    mockTarget
  );

  expect(result).toEqual({
    id: 1,
    statusGUI: STATUS_ERROR,
    error: 'api.error',
    results: ['Fallback error message']
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
    mockStandardData,
    mockContinuumData,
    mockTarget
  );

  expect(result).toEqual({
    id: 1,
    statusGUI: STATUS_ERROR,
    error: 'api.error',
    results: ['api.error']
  });
});
