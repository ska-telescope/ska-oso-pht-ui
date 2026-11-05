import { beforeEach, describe, expect, test, vi } from 'vitest';
import { AxiosError, AxiosResponse } from 'axios';
import GetCoordinates from '@services/axios/get/getCoordinates/getCoordinates.tsx';
import axiosClient from '../../axiosClient/axiosClient';

vi.mock('@services/axiosClient/axiosClient.tsx', () => ({
  default: {
    get: vi.fn()
  }
}));

describe('GetCoordinates Service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('calls axiosClient and maps equatorial response', async () => {
    const mocked_response = {
      target_id: '',
      name: 'M31',
      pointing_pattern: {
        active: 'SinglePointParameters',
        parameters: [
          {
            kind: 'SinglePointParameters',
            offset_x_arcsec: 0.0,
            offset_y_arcsec: 0.0
          }
        ]
      },
      reference_coordinate: {
        kind: 'icrs',
        ra_str: '00:42:44.3300',
        dec_str: '41:16:07.500',
        pm_ra: 0.0,
        pm_dec: 0.0,
        parallax: 0.0,
        epoch: 2000.0
      },
      radial_velocity: {
        quantity: {
          value: -300.0,
          unit: 'km / s'
        },
        definition: 'RADIO',
        reference_frame: 'LSRK',
        redshift: 0.0
      }
    };

    vi.mocked(axiosClient.get).mockResolvedValueOnce({
      data: mocked_response
    });

    const result = await GetCoordinates('M31', 0);
    expect(axiosClient.get).toHaveBeenCalledWith(
      expect.stringContaining('/coordinates/M31/equatorial')
    );
    expect(axiosClient.get).toHaveBeenCalled();
    expect(result).toEqual(mocked_response);
  });

  test('returns error.API_UNKNOWN_ERROR if axiosClient returns undefined', async () => {
    vi.mocked(axiosClient.get).mockResolvedValueOnce(undefined);

    const result = await GetCoordinates('M1', 0);
    expect(result).toEqual({ error: 'API_UNKNOWN_ERROR' });
  });

  const axiosErrorWithStatus = (status?: number, data?: unknown) =>
    new AxiosError(
      'Request failed',
      undefined,
      undefined,
      undefined,
      status === undefined ? undefined : ({ status, data } as AxiosResponse)
    );

  test('returns the backend message with the error code', async () => {
    const detail = 'Object M1 not found in SIMBAD, NED or VizieR.';
    vi.mocked(axiosClient.get).mockRejectedValueOnce(axiosErrorWithStatus(404, { detail }));

    const result = await GetCoordinates('M1', 0);
    expect(result).toEqual({ error: 'notFound', message: detail });
  });

  test('returns the backend message for a resolver failure', async () => {
    const detail = 'Error occurred while resolving target.';
    vi.mocked(axiosClient.get).mockRejectedValueOnce(axiosErrorWithStatus(500, { detail }));

    const result = await GetCoordinates('M1', 0);
    expect(result).toEqual({ error: 'unavailable', message: detail });
  });

  test.each([{}, { detail: '' }, { detail: '   ' }, { detail: { nested: true } }, 'text'])(
    'leaves out the message when the backend sends no usable detail (%o)',
    async (data) => {
      vi.mocked(axiosClient.get).mockRejectedValueOnce(axiosErrorWithStatus(500, data));

      const result = await GetCoordinates('M1', 0);
      expect(result).toEqual({ error: 'unavailable' });
    }
  );

  test('returns notFound if the resolver responds with 404', async () => {
    vi.mocked(axiosClient.get).mockRejectedValueOnce(axiosErrorWithStatus(404));

    const result = await GetCoordinates('M1', 0);
    expect(result).toEqual({ error: 'notFound' });
  });

  test.each([500, 502, 503, 504])(
    'returns unavailable if the resolver responds with %i',
    async (status) => {
      vi.mocked(axiosClient.get).mockRejectedValueOnce(axiosErrorWithStatus(status));

      const result = await GetCoordinates('M1', 0);
      expect(result).toEqual({ error: 'unavailable' });
    }
  );

  test('returns unavailable if the request gets no response', async () => {
    vi.mocked(axiosClient.get).mockRejectedValueOnce(axiosErrorWithStatus());

    const result = await GetCoordinates('M1', 0);
    expect(result).toEqual({ error: 'unavailable' });
  });

  test('returns generic error for any other status', async () => {
    vi.mocked(axiosClient.get).mockRejectedValueOnce(axiosErrorWithStatus(400));

    const result = await GetCoordinates('M1', 0);
    expect(result).toEqual({ error: 'API_UNKNOWN_ERROR' });
  });

  test('returns generic error if axiosClient throws a non-axios Error', async () => {
    vi.mocked(axiosClient.get).mockRejectedValueOnce(new Error('Network failure'));

    const result = await GetCoordinates('M1', 0);
    expect(result).toEqual({ error: 'API_UNKNOWN_ERROR' });
  });

  test('returns generic error if axiosClient throws a non-Error', async () => {
    vi.mocked(axiosClient.get).mockRejectedValueOnce('unexpected');

    const result = await GetCoordinates('M1', 0);
    expect(result).toEqual({ error: 'API_UNKNOWN_ERROR' });
  });
});
