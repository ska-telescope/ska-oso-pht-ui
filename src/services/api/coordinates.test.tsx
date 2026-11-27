import { beforeEach, describe, expect, test, vi } from 'vitest';
import { AxiosError, type AxiosResponse } from 'axios';
import { VELOCITY_TYPE } from '@utils/constants.ts';
import {
  resolveCoordinates,
  RESOLVE_ERROR_NOT_FOUND,
  RESOLVE_ERROR_UNAVAILABLE,
  RESOLVE_ERROR_UNKNOWN
} from './coordinates';

const { mockResolve } = vi.hoisted(() => ({ mockResolve: vi.fn() }));

vi.mock('./client', () => ({
  osoApiBasePath: '',
  publicApi: {
    common: { getSystemcoordinatesOsoApiV17CoordinatesIdentifierReferenceFrameGet: mockResolve }
  }
}));

const icrsTarget = {
  name: 'M31',
  reference_coordinate: { kind: 'icrs', ra_str: '00:42:44.330', dec_str: '+41:16:07.50' },
  radial_velocity: { quantity: { value: -300, unit: 'km/s' }, redshift: 0 }
};

const failure = (status?: number, data?: unknown) =>
  new AxiosError(
    'Request failed',
    'ERR_BAD_RESPONSE',
    undefined,
    undefined,
    status === undefined ? undefined : ({ status, data } as AxiosResponse)
  );

beforeEach(() => {
  vi.resetAllMocks();
});

describe('resolveCoordinates', () => {
  test.each([
    [0, 'equatorial'],
    [1, 'galactic'],
    // Any other kind (e.g. a solar system object) is resolved as equatorial
    [2, 'equatorial'],
    [-1, 'equatorial']
  ])('resolves the name for coordinate kind %s in the %s frame', async (kind, frame) => {
    mockResolve.mockResolvedValue({ data: icrsTarget });

    await resolveCoordinates('M31', kind);

    expect(mockResolve).toHaveBeenCalledExactlyOnceWith('M31', frame);
  });

  test('returns the entry fields of the resolved target', async () => {
    mockResolve.mockResolvedValue({ data: icrsTarget });

    await expect(resolveCoordinates('M31', 0)).resolves.toEqual({
      data: {
        raStr: '00:42:44.330',
        decStr: '+41:16:07.50',
        velType: VELOCITY_TYPE.VELOCITY,
        vel: '-300',
        redshift: ''
      }
    });
  });

  test('returns the unknown error when there is no target', async () => {
    mockResolve.mockResolvedValue({ data: undefined });
    await expect(resolveCoordinates('M31', 0)).resolves.toEqual({ error: RESOLVE_ERROR_UNKNOWN });
  });

  test('returns the unknown error when the target has no coordinates', async () => {
    mockResolve.mockResolvedValue({ data: { name: 'M31' } });
    await expect(resolveCoordinates('M31', 0)).resolves.toEqual({ error: RESOLVE_ERROR_UNKNOWN });
  });

  test('returns not found, with the backend message, for a 404', async () => {
    mockResolve.mockRejectedValue(failure(404, { detail: 'Object M31x not found' }));
    await expect(resolveCoordinates('M31x', 0)).resolves.toEqual({
      error: RESOLVE_ERROR_NOT_FOUND,
      message: 'Object M31x not found'
    });
  });

  test.each([undefined, 502])('returns unavailable for status %s', async (status) => {
    mockResolve.mockRejectedValue(failure(status));
    await expect(resolveCoordinates('M31', 0)).resolves.toEqual({
      error: RESOLVE_ERROR_UNAVAILABLE
    });
  });

  test('returns the unknown error for anything else thrown', async () => {
    mockResolve.mockRejectedValue(new Error('boom'));
    await expect(resolveCoordinates('M31', 0)).resolves.toEqual({ error: RESOLVE_ERROR_UNKNOWN });
  });
});
