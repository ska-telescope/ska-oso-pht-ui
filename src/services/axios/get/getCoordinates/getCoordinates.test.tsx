import { beforeEach, describe, expect, test, vi } from 'vitest';
import GetCoordinates from '@services/axios/get/getCoordinates/getCoordinates.tsx';
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


  test('calls axiosClient and maps equatorial response', async () => {
    const mocked_response = {
        "target_id": "",
        "name": "M31",
        "pointing_pattern": {
            "active": "SinglePointParameters",
            "parameters": [
                {
                    "kind": "SinglePointParameters",
                    "offset_x_arcsec": 0.0,
                    "offset_y_arcsec": 0.0
                }
            ]
        },
        "reference_coordinate": {
            "kind": "icrs",
            "ra_str": "00:42:44.3300",
            "dec_str": "41:16:07.500",
            "pm_ra": 0.0,
            "pm_dec": 0.0,
            "parallax": 0.0,
            "epoch": 2000.0
        },
        "radial_velocity": {
            "quantity": {
                "value": -300.0,
                "unit": "km / s"
            },
            "definition": "RADIO",
            "reference_frame": "LSRK",
            "redshift": 0.0
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
  expect(result).toEqual({ error: 'error.API_UNKNOWN_ERROR' });
});

  test('returns error message if axiosClient throws an Error', async () => {
    vi.mocked(axiosClient.get).mockRejectedValueOnce(new Error('Network failure'));

    const result = await GetCoordinates('M1', 0);
    expect(result).toEqual({ error: 'Network failure' });
  });

  test('returns generic error if axiosClient throws a non-Error', async () => {
    vi.mocked(axiosClient.get).mockRejectedValueOnce('unexpected');

    const result = await GetCoordinates('M1', 0);
    expect(result).toEqual({ error: 'error.API_UNKNOWN_ERROR' });
  });
});
