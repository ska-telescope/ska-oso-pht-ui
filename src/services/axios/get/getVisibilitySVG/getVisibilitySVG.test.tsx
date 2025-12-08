import { describe, it, expect, vi } from 'vitest';
import axiosClient from '@services/axios/axiosClient/axiosClient.tsx';
import GetVisibility from './getVisibilitySVG';

vi.mock('@services/axios/axiosClient/axiosClient.tsx');

describe('GetVisibility', () => {
  const ra = '10:0:0.0';
  const dec = '10:0:0.0';
  const array = 'testArray';

  it('returns result when API call is successful', async () => {
    const mockData = { data: { visible: true } };
    (axiosClient.get as any).mockResolvedValue(mockData);

    const result = await GetVisibility(ra, dec, array);
    expect(result).toEqual(mockData);
    expect(axiosClient.get).toHaveBeenCalledWith(expect.any(String), {
      params: { ra, dec, array }
    });
  });

  it('returns error string when result is missing', async () => {
    (axiosClient.get as any).mockResolvedValue(null);

    const result = await GetVisibility(ra, dec, array);
    expect(result).toBe('error.API_UNKNOWN_ERROR');
  });

  it('returns error object when axios throws an Error', async () => {
    (axiosClient.get as any).mockRejectedValue(new Error('Network error'));

    const result = await GetVisibility(ra, dec, array);
    expect(result).toEqual({ error: 'Network error' });
  });

  it('returns generic error when axios throws non-Error', async () => {
    (axiosClient.get as any).mockRejectedValue('some error');

    const result = await GetVisibility(ra, dec, array);
    expect(result).toEqual({ error: 'error.API_UNKNOWN_ERROR' });
  });
});
