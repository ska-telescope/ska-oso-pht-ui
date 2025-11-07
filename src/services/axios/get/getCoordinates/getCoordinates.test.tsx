import { beforeEach, describe, expect, test, vi } from 'vitest';
import GetCoordinates from '@services/axios/get/getCoordinates/getCoordinates.tsx';
import {
  MockEquatorialCoordinates,
  MockGalacticCoordinates
} from '@services/axios/get/getCoordinates/mockCoordinates.tsx';
import axiosClient from '../../axiosClient/axiosClient';
import * as CONSTANTS from '@/utils/constants';

vi.mock('@services/axiosClient/axiosClient.tsx', () => ({
  default: {
    get: vi.fn()
  }
}));

describe('GetCoordinates Service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('returns mapped mock data when USE_LOCAL_DATA is true', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(true);
    const result = await GetCoordinates('M1', 0);
    expect(result).toEqual(MockEquatorialCoordinates);
  });

  test('returns galactic mock data when USE_LOCAL_DATA is true and unit is 1', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(true);
    const result = await GetCoordinates('M1', 1);
    expect(result).toEqual(MockGalacticCoordinates);
  });

  test('returns error for unknown target name in local mode', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(true);
    const result = await GetCoordinates('UnknownTarget', 0);
    expect(result).toEqual({ error: 'name' });
  });

  test('defaults to unit 0 if skyUnits is out of bounds in local mode', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(true);
    const result = await GetCoordinates('M1', 99);
    expect(result).toEqual(MockEquatorialCoordinates);
  });

  test('calls axiosClient and maps equatorial response when USE_LOCAL_DATA is false', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    vi.mocked(axiosClient.get).mockResolvedValueOnce({
      data: {
        equatorial: {
          ra: '10:00:00.00',
          dec: '-10:00:00.0',
          redshift: 0.001,
          velocity: 300
        }
      }
    });

    const result = await GetCoordinates('M1', 0);
    expect(axiosClient.get).toHaveBeenCalledWith(
      expect.stringContaining('/coordinates/M1/equatorial')
    );
    expect(result).toBe('-10:00:00.0 10:00:00.00 0.001 300 equatorial');
  });

  test('returns error.API_UNKNOWN_ERROR if axiosClient returns undefined', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    vi.mocked(axiosClient.get).mockResolvedValueOnce(undefined);

    const result = await GetCoordinates('M1', 0);
    expect(result).toBe('error.API_UNKNOWN_ERROR');
  });

  test('returns error message if axiosClient throws an Error', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    vi.mocked(axiosClient.get).mockRejectedValueOnce(new Error('Network failure'));

    const result = await GetCoordinates('M1', 0);
    expect(result).toEqual({ error: 'Network failure' });
  });

  test('returns generic error if axiosClient throws a non-Error', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    vi.mocked(axiosClient.get).mockRejectedValueOnce('unexpected');

    const result = await GetCoordinates('M1', 0);
    expect(result).toEqual({ error: 'error.API_UNKNOWN_ERROR' });
  });
});
