import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as constants from '@utils/constants';
import axiosClient from '../../axiosClient/axiosClient';
import GetCoordinates from './getCoordinates';

vi.mock('../../axiosClient/axiosClient', () => ({
  default: {
    get: vi.fn()
  }
}));

let mockedAxiosClient: any;

beforeEach(() => {
  vi.resetAllMocks();
  mockedAxiosClient = axiosClient;
});

describe('GetCoordinates', () => {
  const validTarget = 'M1';
  const invalidTarget = 'Unknown';

  it('returns mapped equatorial result when USE_LOCAL_DATA is true and target is M1 with skyUnits 0', async () => {
    vi.spyOn(constants, 'USE_LOCAL_DATA', 'get').mockReturnValue(true);
    const result = await GetCoordinates(validTarget, 0);
    expect(result).toBe('-00:49:23.7 21:33:27.02 -0.000012 -3.6 equatorial');
  });

  it('returns mapped galactic result when USE_LOCAL_DATA is true and target is M1 with skyUnits 1', async () => {
    vi.spyOn(constants, 'USE_LOCAL_DATA', 'get').mockReturnValue(true);
    const result = await GetCoordinates(validTarget, 1);
    expect(result).toBe('53.37088 -35.76976 -0.000012 -3.6 galactic');
  });

  it('returns error when USE_LOCAL_DATA is true and target is not M1', async () => {
    vi.spyOn(constants, 'USE_LOCAL_DATA', 'get').mockReturnValue(true);
    const result = await GetCoordinates(invalidTarget, 0);
    expect(result).toEqual({ error: 'resolve.error.name' });
  });

  it('returns mapped result from axiosClient when USE_LOCAL_DATA is false and axiosClient returns equatorial data', async () => {
    vi.spyOn(constants, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxiosClient.get.mockResolvedValue({
      data: {
        equatorial: {
          ra: '10:00:00.00',
          dec: '+20:00:00.0',
          redshift: 0.001,
          velocity: 300
        }
      }
    });

    const result = await GetCoordinates(validTarget, 0);
    expect(result).toBe('+20:00:00.0 10:00:00.00 0.001 300 equatorial');
  });

  it('returns mapped result from axiosClient when USE_LOCAL_DATA is false and axiosClient returns galactic data', async () => {
    vi.spyOn(constants, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxiosClient.get.mockResolvedValue({
      data: {
        galactic: {
          lon: 120.5,
          lat: -45.2,
          redshift: 0.002,
          velocity: 600
        }
      }
    });

    const result = await GetCoordinates(validTarget, 1);
    expect(result).toBe('120.5 -45.2 0.002 600 galactic');
  });

  it('returns API_UNKNOWN_ERROR when axiosClient returns undefined', async () => {
    vi.spyOn(constants, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxiosClient.get.mockResolvedValue(undefined);

    const result = await GetCoordinates(validTarget, 0);
    expect(result).toBe('error.API_UNKNOWN_ERROR');
  });

  it('returns error message when axiosClient throws an Error', async () => {
    vi.spyOn(constants, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxiosClient.get.mockRejectedValue(new Error('Network failure'));

    const result = await GetCoordinates(validTarget, 0);
    expect(result).toEqual({ error: 'Network failure' });
  });

  it('returns generic error when axiosClient throws non-Error', async () => {
    vi.spyOn(constants, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxiosClient.get.mockRejectedValue('unexpected string');

    const result = await GetCoordinates(validTarget, 0);
    expect(result).toEqual({ error: 'error.API_UNKNOWN_ERROR' });
  });

  it('defaults to equatorial when skyUnits is out of bounds', async () => {
    vi.spyOn(constants, 'USE_LOCAL_DATA', 'get').mockReturnValue(true);
    const result = await GetCoordinates(validTarget, 99);
    expect(result).toBe('-00:49:23.7 21:33:27.02 -0.000012 -3.6 equatorial');
  });
});
